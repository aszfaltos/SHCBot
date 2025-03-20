from get_query import get_query
from dotenv import load_dotenv

def main():
    """Main entry point for the application"""
    load_dotenv()

    test_prompt ="""
    User: Hogyan tudok diákigazolványt igényelni?
    Assistant: Diákigazolvány igényléséhevel kapcsolatban tanulmányi hivatal tud segíteni.
    User: És hol tudom a következő félévben érvényesíteni?
    """

    print(get_query(test_prompt))


if __name__ == '__main__':
    main()
