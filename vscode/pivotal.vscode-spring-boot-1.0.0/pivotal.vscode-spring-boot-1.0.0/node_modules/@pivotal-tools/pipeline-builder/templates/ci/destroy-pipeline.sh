#!/bin/bash
fly -t tools destroy-pipeline \
    -p "$${pipeline_name}"
