#!/bin/sh

mkdir ./http-test

# curl --write-out "%{http_code}" -k --silent --output ./http-test/home http://localhost:3000/
# curl --write-out "%{http_code}" -k --silent --output ./http-test/blog http://localhost:3000/blog/
# curl --write-out "%{http_code}" -k --silent --output ./http-test/hello-world http://localhost:3000/blog/hello-world/
URL="http://localhost/wp-admin/"
echo "calling: $URL"
response=$(curl --write-out "%{http_code}" -k --silent --output ./http-test/wp-admin $URL)
response_content=`cat ./http-test/wp-admin`
echo "$response_content"
echo ""

# URL of the page to check
URL="http://localhost:3000/blog/hello-world/"
CONTENT="Hello world!"

# Perform the HTTP request, capturing the HTTP status and response content separately
# Do not forget the -k option to bypass localhost CA issues
echo "calling: $URL"
response=$(curl --write-out "%{http_code}" -k --silent --output ./http-test/hello-world $URL)
response_content=`cat ./http-test/hello-world`

# Check for HTTP status 200
if [ ! "$response" -eq 200 ]; then
	echo "WARNING: HTTP status is not 200, but $response."
fi

# Check if the content contains the desired text
if echo "$response_content" | grep -q "$CONTENT"; then
	echo "Success - Content check passed."
	exit 0 # Success
else
	echo "Error - Content check failed. Page does not contain '$CONTENT'"
	echo "$response_content"  # Optionally, show response content for other statuses
	exit 1 # Fail
fi

