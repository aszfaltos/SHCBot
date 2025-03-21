from dotenv import load_dotenv
from create_answer import generate_answer

import gradio as gr


def main():
    """Main entry point for the application"""
    load_dotenv()

    # Create Gradio ChatInterface
    app = gr.ChatInterface(generate_answer, type='messages', title="SHCBot", )

    app.launch(share=False)

if __name__ == '__main__':
    main()
