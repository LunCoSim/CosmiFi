#!/bin/bash

# Load environment variables from .env file
export $(grep -v '^#' .env | xargs)

# Run the dev task
deno task dev