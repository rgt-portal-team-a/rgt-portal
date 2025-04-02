from models.profile import Profile

def format_profile(profile: Profile) -> str:
    """Format profile data into a string for matching"""
    profile_str = f"""
    Current Title: {profile.currentTitle}
    Current Company: {profile.currentCompany}
    Experience: {profile.totalYearsInTech} years in tech
    Education: {profile.highestDegree} from {profile.university} ({profile.graduationYear})
    
    Technical Skills: {profile.technicalSkills}
    Programming Languages: {profile.programmingLanguages}
    Tools & Technologies: {profile.toolsAndTechnologies}
    """
    if profile.certifications:
        profile_str += f"\nCertifications: {profile.certifications}"
    return profile_str