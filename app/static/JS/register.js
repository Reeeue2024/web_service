document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".register_form");
    const message = document.querySelector(".register_message");

    form.addEventListener("submit", async (e) => {
        e.preventDefault(); // 기본 폼 제출 막기

        const username = document.getElementById("register_id").value.trim();
        const password = document.getElementById("register_password").value;

        try {
            // 서버에 회원가입 요청
            const response = await fetch("/api/register", {
                method : "POST",
                headers : { "Content-Type" : "application/json" },
                body : JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (result.result === "success") {
                // 회원가입 성공 시 메시지 표시 및 로그인 페이지로 이동
                message.style.color = "green";
                message.textContent = "Success to Register";
                setTimeout(() => window.location.href = "/login", 500);
            } else {
                // 회원가입 실패 시 서버 메시지 출력
                message.style.color = "red";
                message.textContent = result.message || "Fail to Register";
            }
        } catch (err) {
            // 요청 자체가 실패한 경우
            message.style.color = "red";
            message.textContent = "Server Error";
        }
    });
});