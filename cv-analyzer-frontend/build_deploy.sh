{\rtf1\ansi\ansicpg1252\cocoartf2758
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx566\tx1133\tx1700\tx2267\tx2834\tx3401\tx3968\tx4535\tx5102\tx5669\tx6236\tx6803\pardirnatural\partightenfactor0

\f0\fs24 \cf0 #!/bin/bash\
\
# Exit immediately if a command exits with a non-zero status\
set -e\
\
# Define paths\
REACT_APP_DIR="cv-analyzer-frontend"\
DJANGO_STATIC_DIR="cv_analyzer/static"\
\
# Step 1: Navigate to the React application directory\
echo "Navigating to React application directory..."\
cd $REACT_APP_DIR\
\
# Step 2: Install npm dependencies (optional)\
echo "Installing npm dependencies..."\
npm install\
\
# Step 3: Build the React application\
echo "Building the React application..."\
npm run build\
\
# Step 4: Copy the build output to the Django static files directory\
echo "Copying build output to Django static files directory..."\
rm -rf ../$DJANGO_STATIC_DIR/*\
cp -r build/* ../$DJANGO_STATIC_DIR/\
\
# Step 5: Navigate back to the Django project directory\
echo "Navigating back to Django project directory..."\
cd ..\
\
# Step 6: Collect static files in Django\
echo "Collecting static files in Django..."\
python manage.py collectstatic --noinput\
\
echo "Build and deployment completed successfully."\
}