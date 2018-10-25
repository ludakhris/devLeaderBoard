#!/bin/bash
fly -t tools set-pipeline \
    --load-vars-from secrets.yml \
    -p "$${pipeline_name}" \
    -c pipeline.yml
