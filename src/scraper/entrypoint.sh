#!/bin/bash

# Run the scraper once at startup
/app/run_scraper.sh

# Start cron in foreground
cron -f