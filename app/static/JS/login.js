document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector(".login_form");
    const loginMessage = document.querySelector(".login_message");

    // 로그인 폼 제출 시 실행
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = document.getElementById("login_id").value.trim();
        const pw = document.getElementById("login_password").value;

        try {
            // 서버에 로그인 요청
            const res = await fetch("/api/login", {
                method : "POST",
                headers : { "Content-Type" : "application/json" },
                body : JSON.stringify({ username : id, password : pw })
            });

            if (res.ok) {
                // 로그인 성공
                loginMessage.textContent = "Success to Log In";
                loginMessage.style.color = "green";
                window.location.href = "/";
            } else {
                // 로그인 실패
                loginMessage.textContent = "ERROR : ID OR Password";
                loginMessage.style.color = "red";
            }
        } catch (err) {
            loginMessage.textContent = "Fail to Log In";
        }
    });
});