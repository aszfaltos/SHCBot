from langchain_community.document_loaders import RecursiveUrlLoader

from bs4 import BeautifulSoup
import re
import os
import requests
from urllib.parse import urlparse, unquote

# List of starting URLs
# url = "https://www.inf.elte.hu"
# url = "https://ehok.elte.hu/nu/wp-content/uploads/2024/08/rendszeres_szocialis_tamogatas_24-25-1.pdf"
# url = "https://ehok.elte.hu/nu/index.php/rendszeres-szocialis-tamogatas/"

urls = [
    "https://www.inf.elte.hu",
    "https://ehok.elte.hu/nu/wp-content/uploads/2024/08/rendszeres_szocialis_tamogatas_24-25-1.pdf"
]

def bs4_extractor(html: str) -> str:
    soup = BeautifulSoup(html, "lxml")
    body = soup.find('body')
    if body:
        # Remove script and style elements
        for script_or_style in body(['script', 'style']):
            script_or_style.decompose()
        
        # Process headings and content
        result = []
        
        # Find all elements in the body
        for element in body.find_all(True):
            # Check if element is a heading (h1-h6) and conver h% to #*
            if element.name and re.match(r'^h[1-6]$', element.name):
                heading_level = int(element.name[1])
                heading_text = element.get_text().strip()
                result.append(f"{'#' * heading_level} {heading_text}\n")
            # Handle paragraphs and other text content
            elif element.name == 'p':
                text = element.get_text().strip()
                if text:
                    result.append(f"{text}\n\n")
        
        return "".join(result).strip()
    return ""



def get_filename_from_url(url):
    path = urlparse(url).path
    filename = os.path.basename(path)
    if not filename:  # fallback if URL ends with slash
        filename = "index"
    return unquote(filename.split("?")[0].split("#")[0])


# Create separate directories for PDFs and markdown files
pdf_dir = os.path.join('PDF')
markdown_dir = os.path.join('Markdown')
os.makedirs(pdf_dir, exist_ok=True)
os.makedirs(markdown_dir, exist_ok=True)

for file in os.listdir(pdf_dir):
    os.remove(os.path.join(pdf_dir, file))
for file in os.listdir(markdown_dir):
    os.remove(os.path.join(markdown_dir, file))

for i in range(len(urls)):
    # Create the RecursiveUrlLoader
    loader = RecursiveUrlLoader(
        urls[i],
        max_depth=1,
        extractor=bs4_extractor,
        timeout=1000,
        use_async=False
    )

    documents = loader.lazy_load()

    for doc in documents:
        source = doc.metadata.get("source", "unknown")
        filename_base = get_filename_from_url(source)
        
            # Skip CSS files
        if source.lower().endswith('.css'):
            print(f"Skipping CSS file: {source}")
            continue
        
        # PDF Check
        if source.lower().endswith('.pdf'):
            print(f"Downloading PDF from: {source}")
            try:
                response = requests.get(source)
                response.raise_for_status()
                pdf_filename = os.path.join(pdf_dir, filename_base)
                with open(pdf_filename, 'wb') as f:
                    f.write(response.content)
                print(f"Saved PDF: {pdf_filename}")
            except Exception as e:
                print(f"Failed to download PDF: {e}")
            continue
        
        # Save as Markdown
        print(f"Processing: {source}")
        markdown_filename = os.path.join(markdown_dir, f"{filename_base}.md")
        with open(markdown_filename, 'w', encoding='utf-8') as file:
            file.write(f"# Source URL\n{source}\n\n")
            file.write(doc.page_content)
        print(f"Saved Markdown: {markdown_filename}")
