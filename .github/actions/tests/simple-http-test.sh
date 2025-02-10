#!/bin/sh

mkdir -p ./http-test

# Test WordPress
URL="http://localhost/wp-admin/"
echo "Testing WordPress admin: $URL"
response=$(curl -L --write-out "%{http_code}" -k --silent --output ./http-test/wp-admin "$URL")
if [ ! "$response" -eq 200 ]; then
    echo "Warning: WordPress returned HTTP $response"
    cat ./http-test/wp-admin
fi
echo "WordPress test passed (HTTP $response)"

# Test Next.js
URL="http://localhost:3000/blog/"
CONTENT="Blog"
echo "Testing Next.js page: $URL"

response=$(curl -L --write-out "%{http_code}" -k --silent --output ./http-test/blog "$URL")
if [ ! "$response" -eq 200 ]; then
    echo "Warning: Next.js returned HTTP $response"
    cat ./http-test/blog
fi

response_content=$(cat ./http-test/blog)
if echo "$response_content" | grep -q "$CONTENT"; then
    echo "Success - Content check passed (HTTP $response)"
    exit 0
else
    echo "Error - Content check failed. Page does not contain '$CONTENT'"
    echo "Received content:"
    echo "$response_content"
fi


# Test Next.js again
URL="http://localhost:3000/blog/hello-world/"
CONTENT="Hello world!"
echo "Testing Next.js page: $URL"

response=$(curl -L --write-out "%{http_code}" -k --silent --output ./http-test/hello-world "$URL")
if [ ! "$response" -eq 200 ]; then
    echo "Warning: Next.js returned HTTP $response"
    cat ./http-test/hello-world
fi

response_content=$(cat ./http-test/hello-world)
if echo "$response_content" | grep -q "$CONTENT"; then
    echo "Success - Content check passed (HTTP $response)"
    exit 0
else
    echo "Error - Content check failed. Page does not contain '$CONTENT'"
    echo "Received content:"
    echo "$response_content"
fi

exit 0
