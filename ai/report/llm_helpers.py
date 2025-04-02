import os
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import json
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


def get_llm_client():
    """Initialize and return a Groq LLM client using langchain"""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable not set")
    
    # Initialize the LLM
    llm = ChatGroq(
        api_key=api_key,
        model_name="llama-3.3-70b-versatile"  # You can adjust the model as needed
    )
    return llm

def generate_employee_insights(employee_data_json):
    """Generate insights on employee data using LLM"""
    try:
        llm = get_llm_client()
        
        # Create a prompt template
        prompt = ChatPromptTemplate.from_template(
            """You are an expert HR analyst. Analyze the following employee data and provide 
            strategic insights and actionable recommendations:
            
            {employee_data}
            
            Provide your analysis in the following format:
            
            ## Key Insights
            - [Insight 1]
            - [Insight 2]
            - [Insight 3]
            
            ## Strategic Recommendations
            - [Recommendation 1]
            - [Recommendation 2]
            - [Recommendation 3]
            
            ## Risk Factors
            - [Risk 1]
            - [Risk 2]
            
            ## Opportunities
            - [Opportunity 1]
            - [Opportunity 2]
            
            Keep your analysis concise yet insightful, based strictly on the data provided.
            """
        )
        
        # Process with LLM
        chain = prompt | llm | StrOutputParser()
        result = chain.invoke({"employee_data": employee_data_json})
        
        return result
    except Exception as e:
        logger.error(f"Error generating employee insights: {str(e)}")
        return f"""
## LLM Analysis Error

We couldn't generate AI insights at this time: {str(e)}

Please ensure your GROQ_API_KEY is properly set in your environment variables.
"""

def generate_recruitment_insights(recruitment_data_json):
    """Generate insights on recruitment data using LLM"""
    try:
        llm = get_llm_client()
        
        # Create a prompt template
        prompt = ChatPromptTemplate.from_template(
            """You are an expert recruitment analyst. Analyze the following recruitment data and provide 
            strategic insights and recommendations to improve the recruitment process:
            
            {recruitment_data}
            
            Provide your analysis in the following format:
            
            ## Recruitment Pipeline Analysis
            - [Analysis point 1]
            - [Analysis point 2]
            - [Analysis point 3]
            
            ## Efficiency Recommendations
            - [Recommendation 1]
            - [Recommendation 2]
            
            ## Improvement Areas
            - [Area 1]
            - [Area 2]
            
            ## Candidate Experience Enhancement
            - [Enhancement suggestion 1]
            - [Enhancement suggestion 2]
            
            Keep your analysis concise yet insightful, based strictly on the data provided.
            """
        )
        
        # Process with LLM
        chain = prompt | llm | StrOutputParser()
        result = chain.invoke({"recruitment_data": recruitment_data_json})
        
        return result
    except Exception as e:
        logger.error(f"Error generating recruitment insights: {str(e)}")
        return f"""
## LLM Analysis Error

We couldn't generate AI insights at this time: {str(e)}

Please ensure your GROQ_API_KEY is properly set in your environment variables.
"""