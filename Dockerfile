FROM python:3.10

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app
RUN pip install --upgrade pip
COPY requirements.txt /app/
RUN pip install -r requirements.txt

COPY . /app/
RUN python manage.py collectstatic --settings vocbuilder.settings.prod