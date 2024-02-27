import streamlit as st
from evaluation_copilot.base import MODEL, EvaluationCopilot, RelevanceEvaluationCopilot, ImprovementCopilot
from evaluation_copilot.models import EvaluationInput, ImprovementInput
import openai

# Load your environment variables and set up OpenAI
from dotenv import load_dotenv
import os

load_dotenv()
openai.api_key = os.environ.get("OPENAI_API_KEY")
client = openai.Client()
# Initialize the copilots
eval_copilot = EvaluationCopilot(logging=True)
relevance_eval_copilot = RelevanceEvaluationCopilot(logging=True)
improvement_copilot = ImprovementCopilot(logging=True)

def get_llm_response(question: str) -> str:
    """
    Function to get the response from an LLM for a given question.
    """
    response = client.chat.completions.create(
            model=MODEL, messages=[{"role": "system", "content": question}]
        )
    generated_text = response.choices[0].message.content
    return generated_text

st.title('Evaluation Copilot Demo')

if 'relevance_check' not in st.session_state:
    st.session_state['relevance_check'] = False

# Define the callback function for the checkbox
def on_relevance_check_change():
    st.session_state.relevance_check = not st.session_state.relevance_check

# Checkbox with on_change callback to toggle the session state
relevance_check = st.checkbox("Evaluate for Relevance", value=st.session_state.relevance_check, on_change=on_relevance_check_change)

# The text area is displayed only if the checkbox is checked
if relevance_check:
    context = st.text_area("Enter context for relevance evaluation:", value="France is a country in Western Europe known for its cities, history, and landmarks.")

question = st.text_input("Enter your question:", value="What is the capital of France?")

# Button to handle the submit action
submit_button = st.button("Submit")

if submit_button:
    # Get the LLM response
    llm_answer = get_llm_response(question)
    st.write("## LLM Answer", unsafe_allow_html=True)
    st.info(llm_answer)

    # Prepare the evaluation input, including context if relevance evaluation is checked
    eval_input = EvaluationInput(question=question, answer=llm_answer, context=context if relevance_check else None)
    
    # Evaluate the LLM response based on whether relevance is checked
    if relevance_check:
        eval_output = relevance_eval_copilot.evaluate(eval_input)
    else:
        eval_output = eval_copilot.evaluate(eval_input)
    st.write("## Evaluation", unsafe_allow_html=True)
    st.success(f"Score: {eval_output.score}")
    st.write(f"Justification:\n{eval_output.justification}")

    # Suggest improvements
    improvement_input = ImprovementInput(question=question, answer=llm_answer, score=eval_output.score, justification=eval_output.justification, context=context if relevance_check else None)
    improvement_output = improvement_copilot.suggest_improvements(improvement_input)
    st.write("## Improvement Suggestions", unsafe_allow_html=True)
    st.warning(f"Question Improvement:\n{improvement_output.question_improvement}")
    st.warning(f"Answer Improvement:\n{improvement_output.answer_improvement}")