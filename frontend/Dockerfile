# Use the official Nginx image (alpine version for minimal footprint)
FROM nginx:alpine

# Remove the default website content
RUN rm -rf /usr/share/nginx/html/*

# Copy the entire frontend folder (including css and js subfolders) into Nginx's html folder
COPY . /usr/share/nginx/html

# Expose port 80 for the container
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
