#!/bin/bash
# Run the Python script in an infinite loop with a 10-second interval
while true; do
    python3 /home/techrammy/mittedelivery/MitteAnalytics/outputaustest.py final_austest.sh
    sleep 10
done