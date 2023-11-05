#get the latest alpine image from node registry
FROM node:16-alpine AS dependencies
RUN npm i -g pnpm
#set the working directory
WORKDIR /app

#copy the package and package lock files
#from local to container work directory /app
COPY package.json /app/
COPY pnpm-lock.yaml /app/

#Run command npm install to install packages
RUN pnpm install

#copy all the folder contents from local to container & build
FROM node:16-alpine as builder
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN npm run build

#specify env variables at runtime
FROM node:16-alpine as runner
WORKDIR /app
ARG NEXT_PUBLIC_USER_SERVICE_URL
ARG NEXT_PUBLIC_APPLICATION_ID
ARG NEXT_PUBLIC_BACKEND_SERVICE_URL
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_FIREBASE_APP_MEASUREMENT_ID

ENV NEXT_PUBLIC_USER_SERVICE_URL $NEXT_PUBLIC_USER_SERVICE_URL
ENV NEXT_PUBLIC_APPLICATION_ID $NEXT_PUBLIC_APPLICATION_ID
ENV NEXT_PUBLIC_BACKEND_SERVICE_URL $NEXT_PUBLIC_BACKEND_SERVICE_URL
ENV NEXT_PUBLIC_FIREBASE_API_KEY $NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN $NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID $NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET $NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID $NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV NEXT_PUBLIC_FIREBASE_APP_ID $NEXT_PUBLIC_FIREBASE_APP_ID
ENV NEXT_PUBLIC_FIREBASE_APP_MEASUREMENT_ID $NEXT_PUBLIC_FIREBASE_APP_MEASUREMENT_ID
ENV NODE_ENV production

# If you are using a custom next.config.js file, uncomment this line.
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "run", "start"]