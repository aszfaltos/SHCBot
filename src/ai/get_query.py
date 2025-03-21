from openai import OpenAI

def get_query(chat_history: str) -> str:
    """
    This function takes in a chat history and generates a query that can be passed to a vectorstore.

    Args:
        chat_history (String): The chat history to generate a query from.

    Returns:
        String: A query that can be passed to a vectorstore. Usually a statement rather than a question.
    """
    
    system_prompt = """
    You are an assistant LLM who takes in a conversation and generates a query that can be used as a query in a vector database.
    Your users will ask you to answer questions about ELTE University in Hungarian or English. The answers for the questions can be found in the vector database.
    Your task is to generate a query that can possibly be found in the vector database:
        - Always generate a statement and avoid generating a question.
        - Do not include information about the university, only the statement.
        - If the users question is in Hungarian, you should generate the query in Hungarian.
        - If the users question is in English, you should generate the query in English.
        - If the users question is not in Hungarian or English, you should generate the query in English.
    """

    client = OpenAI()

    response = client.responses.create(
        model="gpt-4o-mini",
        instructions=system_prompt,
        input=chat_history,
    )

    return response.output_text