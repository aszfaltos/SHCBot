#!/bin/bash

cd /app
echo "Starting scraper at $(date)"
python /app/Scrapper_script.py
echo "Scraper completed at $(date)"