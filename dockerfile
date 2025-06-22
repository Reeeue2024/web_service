FROM python:3.10-slim

WORKDIR /app

COPY app/ /app

RUN pip install --upgrade pip
RUN pip install -r require.txt

EXPOSE 5000

CMD ["python", "app.py"]