import pandas as pd
import numpy as np
import re
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
from dateutil.relativedelta import relativedelta
import datetime


class CandidateJobMatcher:
    def __init__(self, model_name='paraphrase-mpnet-base-v2'):
        """
        Initialize the matcher with a transformer model.

        Args:
            model_name: The pre-trained model to use for embeddings
        """
        self.model = SentenceTransformer(model_name)

        # Define weights for different matching factors
        self.weights = {
            'skill_match': 0.4,
            'experience_match': 0.3,
            'education_match': 0.15,
            'industry_match': 0.15
        }

        # Keywords mapping for different job categories
        self.category_keywords = {
            'Development': ['developer', 'programming', 'software', 'code', 'web', 'frontend', 'backend', 'fullstack'],
            'Design': ['design', 'ui', 'ux', 'user interface', 'user experience', 'creative', 'visual'],
            'Quality Assurance': ['qa', 'quality', 'testing', 'test', 'automation', 'bugs'],
            'Management': ['manager', 'management', 'leadership', 'team lead', 'supervisor', 'director'],
            'Marketing': ['marketing', 'social media', 'digital marketing', 'seo', 'content', 'campaign'],
            'IT Support': ['support', 'helpdesk', 'technical support', 'service desk', 'troubleshoot'],
            'Blockchain': ['blockchain', 'crypto', 'web3', 'defi', 'ethereum', 'solidity'],
            'Artificial Intelligence': ['ai', 'machine learning', 'ml', 'data science', 'nlp', 'deep learning'],
            'DevOps': ['devops', 'cicd', 'infrastructure', 'automation', 'cloud', 'aws', 'azure']
        }

    def extract_years_experience(self, candidate_data):
        """
        Extract total years of experience from candidate data
        """
        # Try to get explicitly stated total years in tech
        if 'Total Years in Tech' in candidate_data:
            experience_text = str(candidate_data['Total Years in Tech'])
            if experience_text and experience_text.lower() != 'not specified':
                # Try to extract number from text like "5 years" or just "5"
                match = re.search(r'(\d+)', experience_text)
                if match:
                    return int(match.group(1))

        # If not available, calculate from job durations
        total_months = 0
        job_columns = [
            col for col in candidate_data.index if 'Job_' in col and 'Duration' in col]

        for job_col in job_columns:
            duration = str(candidate_data[job_col])
            if duration and duration.lower() != 'not specified':
                # Extract years and months from format like "2 years 5 months"
                years_match = re.search(r'(\d+)\s*years?', duration)
                months_match = re.search(r'(\d+)\s*months?', duration)

                years = int(years_match.group(1)) if years_match else 0
                months = int(months_match.group(1)) if months_match else 0

                total_months += (years * 12) + months

        return total_months / 12  # Convert to years

    def extract_education_level(self, candidate_data):
        """
        Extract education level from candidate data
        """
        education_hierarchy = {
            'high school': 1,
            'diploma': 2,
            'hnd': 3,
            'bachelor': 4,
            'master': 5,
            'phd': 6
        }

        # Check highest degree
        highest_degree = str(candidate_data.get('Highest Degree', '')).lower()

        for level, score in education_hierarchy.items():
            if level in highest_degree:
                return score

        # If no match in highest degree, look for other education-related info
        program = str(candidate_data.get('Program', '')).lower()
        school = str(candidate_data.get('School', '')).lower()

        # If there's a program or school but no degree level detected, assume bachelor's (common default)
        if (program and program != 'not specified') or (school and school != 'not specified'):
            return 4

        return 0  # Unknown or not specified

    def extract_skills(self, candidate_data):
        """
        Extract all skills from candidate data
        """
        skill_fields = ['Technical Skills', 'Soft Skills',
                        'Tools & Technologies', 'Programming Languages']
        all_skills = []

        # Check if candidate_data is a pandas Series or DataFrame
        is_pandas_object = hasattr(candidate_data, 'index')

        for field in skill_fields:
            if field in candidate_data and candidate_data[field] and str(candidate_data[field]).lower() != 'not specified':
                skills = str(candidate_data[field]).split(',')
                all_skills.extend([skill.strip() for skill in skills])

        # Also check recent technologies
        if 'Recent Technologies' in candidate_data and candidate_data['Recent Technologies'] and str(candidate_data['Recent Technologies']).lower() != 'not specified':
            recent_tech = str(candidate_data['Recent Technologies']).split(',')
            all_skills.extend([tech.strip() for tech in recent_tech])

        # Check job titles for skill implications
        # Modified to handle both pandas objects and dictionaries
        if is_pandas_object:
            job_title_fields = [col for col in candidate_data.index if 'Job_' in col and 'Title' in col]
        else:
            job_title_fields = [key for key in candidate_data.keys() if 'Job_' in key and 'Title' in key]
            
        for field in job_title_fields:
            if field in candidate_data and candidate_data[field]:
                all_skills.append(str(candidate_data[field]))

        # Remove duplicates and empty strings
        return list(set([s for s in all_skills if s]))

    def extract_industries(self, candidate_data):
        """
        Extract industries from candidate data
        """
        industries = []

        # Check if candidate_data is a pandas Series or DataFrame
        is_pandas_object = hasattr(candidate_data, 'index')

        if 'Industries' in candidate_data and candidate_data['Industries'] and str(candidate_data['Industries']).lower() != 'not specified':
            industries = [ind.strip() for ind in str(
                candidate_data['Industries']).split(',')]

        # Also check company fields for industry implications
        if is_pandas_object:
            company_fields = [col for col in candidate_data.index if 'Job_' in col and 'Company' in col]
        else:
            company_fields = [key for key in candidate_data.keys() if 'Job_' in key and 'Company' in key]
            
        for field in company_fields:
            if field in candidate_data and candidate_data[field]:
                industries.append(str(candidate_data[field]))

        # Remove duplicates and empty strings
        return list(set([i for i in industries if i]))

    def parse_job_requirements(self, job_data):
        """
        Extract key requirements from job data
        """
        requirements = {
            'min_experience': 0,
            'education_level': 0,
            'required_skills': [],
            'preferred_skills': [],
            'industry_focus': []
        }

        # Extract minimum experience
        exp_text = job_data.get('min_experience', '')
        if exp_text:
            exp_match = re.search(
                r'(\d+)[\+\-]?\s*(?:years?|yrs?)', exp_text.lower())
            if exp_match:
                requirements['min_experience'] = int(exp_match.group(1))

        # Extract education level
        edu_text = job_data.get('education', '').lower()
        if 'bachelor' in edu_text or "bachelor's" in edu_text:
            requirements['education_level'] = 4
        elif 'master' in edu_text or "master's" in edu_text:
            requirements['education_level'] = 5
        elif 'phd' in edu_text or 'doctorate' in edu_text:
            requirements['education_level'] = 6

        # Extract skills
        if 'skills' in job_data and job_data['skills']:
            requirements['required_skills'] = [skill.strip()
                                               for skill in job_data['skills'].split(',')]

        if 'preferred' in job_data and job_data['preferred']:
            requirements['preferred_skills'] = [skill.strip()
                                                for skill in job_data['preferred'].split(',')]

        # Extract industry focus from category and overview
        requirements['industry_focus'].append(job_data.get('category', ''))

        overview = job_data.get('position_overview', '')
        if overview:
            # Add any category keywords found in overview
            for category, keywords in self.category_keywords.items():
                for keyword in keywords:
                    if keyword.lower() in overview.lower():
                        requirements['industry_focus'].append(category)
                        break

        # Remove duplicates
        requirements['industry_focus'] = list(
            set(requirements['industry_focus']))

        return requirements

    def calculate_skill_match(self, candidate_skills, job_required_skills, job_preferred_skills):
        """
        Calculate skill match score between candidate and job
        """
        if not candidate_skills or not job_required_skills:
            return 0.0

        # Convert to lowercase for better matching
        candidate_skills_lower = [skill.lower() for skill in candidate_skills]
        job_required_skills_lower = [skill.lower()
                                     for skill in job_required_skills]
        job_preferred_skills_lower = [
            skill.lower() for skill in job_preferred_skills] if job_preferred_skills else []

        # Calculate semantic similarity using embeddings
        candidate_embedding = self.model.encode(
            [' '.join(candidate_skills_lower)])[0]
        job_embedding = self.model.encode(
            [' '.join(job_required_skills_lower)])[0]

        semantic_similarity = cosine_similarity(
            [candidate_embedding], [job_embedding])[0][0]

        # Count direct matches (exact or substring)
        required_matches = 0
        preferred_matches = 0

        for job_skill in job_required_skills_lower:
            for candidate_skill in candidate_skills_lower:
                if job_skill in candidate_skill or candidate_skill in job_skill:
                    required_matches += 1
                    break

        for job_skill in job_preferred_skills_lower:
            for candidate_skill in candidate_skills_lower:
                if job_skill in candidate_skill or candidate_skill in job_skill:
                    preferred_matches += 1
                    break

        # Calculate match percentages
        if job_required_skills:
            required_match_pct = min(
                required_matches / len(job_required_skills), 1.0)
        else:
            required_match_pct = 0.0

        if job_preferred_skills:
            preferred_match_pct = min(
                preferred_matches / len(job_preferred_skills), 1.0)
        else:
            preferred_match_pct = 0.0

        # Combine scores (70% semantic similarity, 20% required matches, 10% preferred matches)
        combined_score = (0.7 * semantic_similarity) + \
            (0.2 * required_match_pct) + (0.1 * preferred_match_pct)

        return combined_score

    def calculate_experience_match(self, candidate_years, job_min_years):
        """
        Calculate experience match score
        """
        if job_min_years == 0:
            return 1.0  # If no minimum specified, everyone matches

        if candidate_years >= job_min_years:
            # Give bonus for having more than minimum, up to 2x the requirement
            return min(1.0 + ((candidate_years - job_min_years) / job_min_years) * 0.5, 2.0) / 2
        else:
            # Partial credit for being close to the requirement
            return max(0.0, candidate_years / job_min_years)

    def calculate_education_match(self, candidate_education_level, job_education_level):
        """
        Calculate education match score
        """
        if job_education_level == 0:
            return 1.0  # If no minimum specified, everyone matches

        if candidate_education_level >= job_education_level:
            return 1.0
        else:
            # Partial credit for being close
            return max(0.0, candidate_education_level / job_education_level)

    def calculate_industry_match(self, candidate_industries, job_industries):
        """
        Calculate industry match score
        """
        if not candidate_industries or not job_industries:
            return 0.5  # Neutral score if no information

        # Convert to lowercase for better matching
        candidate_industries_lower = [ind.lower()
                                      for ind in candidate_industries]
        job_industries_lower = [ind.lower() for ind in job_industries]

        # Calculate semantic similarity using embeddings
        candidate_embedding = self.model.encode(
            [' '.join(candidate_industries_lower)])[0]
        job_embedding = self.model.encode([' '.join(job_industries_lower)])[0]

        semantic_similarity = cosine_similarity(
            [candidate_embedding], [job_embedding])[0][0]

        # Count direct matches
        direct_matches = 0
        for job_ind in job_industries_lower:
            for candidate_ind in candidate_industries_lower:
                if job_ind in candidate_ind or candidate_ind in job_ind:
                    direct_matches += 1
                    break

        # Calculate match percentage
        if job_industries:
            match_pct = min(direct_matches / len(job_industries), 1.0)
        else:
            match_pct = 0.0

        # Combine scores (70% semantic similarity, 30% direct matches)
        combined_score = (0.7 * semantic_similarity) + (0.3 * match_pct)

        return combined_score

    def predict_match_score(self, candidate_data, job_data):
        """
        Predict match score between a candidate and a job
        """
        # Convert job_data to a dictionary if it's a DataFrame
        # This handles both dictionary and DataFrame inputs
        if hasattr(job_data, 'to_dict'):
            # If it's a DataFrame, convert the first row to a dict
            job_dict = job_data.iloc[0].to_dict() if len(job_data) > 0 else {}
        elif isinstance(job_data, pd.DataFrame):
            # Another way to check and convert DataFrame to dict
            job_dict = job_data.iloc[0].to_dict() if len(job_data) > 0 else {}
        else:
            # If it's already a dictionary, use it directly
            job_dict = job_data

        # Convert candidate_data to a dictionary if it's a Series or DataFrame
        if isinstance(candidate_data, pd.Series):
            candidate_dict = candidate_data.to_dict()
        elif isinstance(candidate_data, pd.DataFrame):
            candidate_dict = candidate_data.iloc[0].to_dict() if len(
                candidate_data) > 0 else {}
        else:
            candidate_dict = candidate_data

        # Extract candidate information
        candidate_years = self.extract_years_experience(candidate_dict)
        candidate_education = self.extract_education_level(candidate_dict)
        candidate_skills = self.extract_skills(candidate_dict)
        candidate_industries = self.extract_industries(candidate_dict)

        # Extract job requirements
        job_requirements = self.parse_job_requirements(job_dict)

        # Calculate individual match scores
        skill_score = self.calculate_skill_match(
            candidate_skills,
            job_requirements['required_skills'],
            job_requirements['preferred_skills']
        )

        experience_score = self.calculate_experience_match(
            candidate_years,
            job_requirements['min_experience']
        )

        education_score = self.calculate_education_match(
            candidate_education,
            job_requirements['education_level']
        )

        industry_score = self.calculate_industry_match(
            candidate_industries,
            job_requirements['industry_focus']
        )

        # Calculate weighted total score
        total_score = (
            skill_score * self.weights['skill_match'] +
            experience_score * self.weights['experience_match'] +
            education_score * self.weights['education_match'] +
            industry_score * self.weights['industry_match']
        )

        # Scale to 0-100
        match_score = total_score * 100

        return match_score
