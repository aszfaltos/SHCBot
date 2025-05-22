FROM python:3.10-slim

WORKDIR /app

# Install cron and other dependencies
RUN apt-get update && apt-get install -y \
    cron \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements (create this file with your dependencies)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Setup cron job
COPY crontab /etc/cron.d/scraper-cron
RUN chmod 0644 /etc/cron.d/scraper-cron
RUN crontab /etc/cron.d/scraper-cron

RUN chmod +x run_scraper.sh entrypoint.sh

# Run the entrypoint script
CMD ["/app/entrypoint.sh"]