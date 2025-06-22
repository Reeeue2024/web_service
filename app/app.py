# Import : 기본 라이브러리
import os
import time
# Import : 외부 라이브러리
from flask import Flask, render_template, request, redirect, url_for, jsonify, session, g
import pymysql



# [ 0-1. ] App 초기화
app = Flask(__name__)
app.secret_key = "secret_key"

# [ 0-2. ] ENV 파일에서 DB 정보 Load
MYSQL_USER = os.getenv('MYSQL_USER')
MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD')
MYSQL_DATABASE = os.getenv('MYSQL_DATABASE')
MYSQL_HOST = os.getenv('MYSQL_HOST', 'mysql-db')

# [ 0-3-1. ] MySQL DB에 연결하는 함수 (도움 : 생성형 AI) => 유지 보수 및 효율을 위해
def get_db() :
    if 'db' not in g : # g : Flask에서 제공하는 특수 객체
        g.db = pymysql.connect(
            host = MYSQL_HOST,
            user = MYSQL_USER,
            password = MYSQL_PASSWORD,
            database = MYSQL_DATABASE,
            cursorclass = pymysql.cursors.DictCursor, # 딕셔너리 형태로 결과를 받는다.
            autocommit = True # 쿼리를 실행한 즉시 자동으로 저장 (Commit)
        )
    return g.db
# [ 0-3-2. ] MySQL DB와 연결을 해제하는 함수 (도움 : 생성형 AI) => 유지 보수 및 효율을 위해
@app.teardown_appcontext
def close_db(error) :
    db = g.pop('db', None)
    if db is not None :
        db.close()



######### [ Page Routing ] #########

# Main Page
@app.route('/')
def index() :
    return render_template('index.html')

# Archive Page
@app.route('/archive')
def archive() :
    return render_template('archive.html')

# Log In Page
@app.route('/login')
def login() :
    # 오류로 인해 잠시 주석 처리
    # if "user_id" in session :
    #     return redirect(url_for('index')) # 로그인을 이미 진행한 환경의 경우, 접근할 수 없게
    return render_template('login.html')

# Register Page
@app.route('/register')
def register() :
    # 오류로 인해 잠시 주석 처리
    # if "user_id" in session :
    #     return redirect(url_for('index')) # 로그인을 이미 진행한 환경의 경우, 접근할 수 없게
    return render_template('register.html')

# Create Post Page
@app.route('/post')
def post() :
    return render_template('post.html')

# Post Detail Page
@app.route('/post/<int:post_id>')
def post_detail(post_id) :
    db = get_db()
    with db.cursor() as cursor :
        cursor.execute("SELECT * FROM post WHERE id = %s", (post_id,))
        post = cursor.fetchone() # 쿼리 결과 중 첫 번째 행 하나만 가져온다.
        if not post :
            return "No Post", 404
    return render_template('post_detail.html', post = post)



######### [ API : Post 관련 ] #########

# Get All Posts
@app.route('/api/posts')
def get_posts() :
    db = get_db()
    with db.cursor() as cursor :
        cursor.execute("SELECT * FROM post ORDER BY id DESC") # 모든 데이터를 가져올 때, id의 역순으로 (최신 글 순서로) 정렬해 가져온다.
        posts = cursor.fetchall() # 전체 행 결과 모두를 가져온다.
    return jsonify(posts) # 결과를 JSON 형식으로 반환

# Create New Post
@app.route('/api/posts', methods = ['POST'])
def create_post() :
    data = request.get_json()
    db = get_db()
    with db.cursor() as cursor :
        sql = "INSERT INTO post (title, content, date, upvote) VALUES (%s, %s, %s, %s)" # SQL 쿼리 : post 테이블에 새 데이터 추가
        cursor.execute(sql, (data.get("title"), data.get("content"), data.get("date"), 0))
        post_id = cursor.lastrowid # 방금 추가한 글의 id를 가져온다.
    return jsonify({"result" : "success", "post_id" : post_id}) # 결과를 JSON 형식으로 반환



######### [ API : Authenticate 관련 ] #########

# Log In (Create Session)
@app.route('/api/login', methods = ['POST'])
def api_login() :
    data = request.get_json()
    db = get_db()
    with db.cursor() as cursor :
        cursor.execute(
            "SELECT * FROM user WHERE username = %s AND password = %s", # 입력된 ID/PW와 일치하는 사용자를 조회
            (data.get("username"), data.get("password"))
        )
        user = cursor.fetchone() # 결과 중 하나를 (로그인 사용자 정보) 가져온다.

        if user : # 로그인 성공 경우
            session["user_id"] = user["id"] # 사용자 ID를 세션에 저장 (로그인 유지를 위해)
            return jsonify({"result" : "success"})

    return jsonify({"result" : "fail"}), 401

# Log Out (Destroy Session)
@app.route('/api/logout', methods = ['POST'])
def api_logout() :
    session.pop("user_id", None) # 세션에서 user_id 키를 제거 (로그아웃 처리)
    return jsonify({"result" : "success"})

# Check User
@app.route('/api/auth')
def check_login() :
    user_id = session.get("user_id") # 세션에서 user_id 값을 가져온다.

    if not user_id : # 로그인을 하지 않은 경우
        return jsonify({"is_log_in" : False})

    db = get_db()
    with db.cursor() as cursor :
        cursor.execute("SELECT username FROM user WHERE id = %s", (user_id,)) # user_id로 사용자 정보 조회
        user = cursor.fetchone()  # 사용자 정보를 가져온다.

        if not user :  # 해당 ID가 없는 경우
            return jsonify({"is_log_in" : False})

    return jsonify({ # 로그인되어 있는 경우
        "is_log_in" : True,
        "username" : user["username"]
    })

# Register New User
@app.route('/api/register', methods = ['POST'])
def api_register() :
    data = request.get_json()
    username = data.get("username") # username 추출
    password = data.get("password") # password 추출

    if not username or not password : # 하나라도 비어 있을 경우
        return jsonify({"result" : "fail", "message" : "ID/PW is required"}), 400

    db = get_db()
    with db.cursor() as cursor :
        cursor.execute("SELECT id FROM user WHERE username = %s", (username,)) # 이미 있는 username인지 확인
        if cursor.fetchone() : # 중복 사용자가 있을 경우
            return jsonify({"result" : "fail", "message" : "Username already exists"}), 409

        cursor.execute( # 사용자 정보 DB에 저장
            "INSERT INTO user (username, password) VALUES (%s, %s)",
            (username, password)
        )

    return jsonify({"result" : "success"})



######### [ DB : Initialize ] #########

def initialize_database() :
    db = get_db()
    with db.cursor() as cursor :
        # [ DB : Schema ] User 테이블이 없는 경우 : User Table 생성
        # id : 숫자 자동 증가, 기본 키
        # username : 80자 제한, 고유한 값만 허용, 필수 입력
        # password : 120자 제한, 필수 입력
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(80) UNIQUE NOT NULL,
                password VARCHAR(120) NOT NULL
            )
        """)
        # [ DB : Schema ] Post 테이블이 없는 경우 : Post Table 생성
        # id : 숫자 자동 증가
        # title : 최대 255자, 필수
        # content : 필수
        # date : 작성 날짜를 문자열로 저장
        # upvote : 추천 수, 기본 값 0
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS post (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                date VARCHAR(20) NOT NULL,
                upvote INT DEFAULT 0
            )
        """)

        # [ DB : Seed Data ] 기본 Admin 계정이 없는 경우 : 기본 Admin 계정 생성 (추후에 Admin 관련 기능 추가 확장을 생각하고 있어서)
        cursor.execute("SELECT id FROM user WHERE username = 'admin'")
        if not cursor.fetchone() :
            cursor.execute("INSERT INTO user (username, password) VALUES (%s, %s)", ("admin", "1234"))



# [ App : Entry Point ]
if __name__ == '__main__' :
    retry_number = 10

    while retry_number > 0 :
        try :
            with app.app_context() :
                initialize_database()
            print("Success to Connect to DB")
            break
        
        except Exception as e :
            print(f"Fail to Connect to DB : {e} ( Retry ... )") # DB 연결 실패할 경우, Retry
            time.sleep(3)
            retry_number -= 1
    
    else :
        print("Can Not Connect to DB ( Retry - Fail )")
        exit(1)

    app.run(host = '0.0.0.0', debug = True) # DB 연결 성공할 경우, 앱 실행