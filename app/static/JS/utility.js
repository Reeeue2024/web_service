document.addEventListener("DOMContentLoaded", async () => {
    const authenticateLink = document.getElementById("authenticate_link");
    const usernameDisplay = document.getElementById("username");

    try {
        // 로그인 상태 확인 요청
        const res = await fetch("/api/auth");
        const data = await res.json();

        if (data.is_log_in) {
            // 로그인 상태인 경우 : 로그아웃 링크로 변경
            authenticateLink.textContent = "Log Out";
            authenticateLink.href = "#";

            // 로그아웃 클릭 시 처리
            authenticateLink.onclick = (e) => {
                e.preventDefault();

                if (confirm("Want to Log Out?")) {
                    // 로그아웃 요청 후 페이지 새로고침
                    fetch("/api/logout", { method: "POST" }).then(() => window.location.reload());
                }
            };

            // 로그인 진행한 사용자 이름 표시
            if (usernameDisplay) {
                usernameDisplay.textContent = `${data.username} | `;
            }
        } else {
            // 로그인 상태가 아닌 경우 : 로그인 링크로 설정
            authenticateLink.textContent = "Log In";
            authenticateLink.href = "/login";

            // 사용자 이름 삭제
            if (usernameDisplay) {
                usernameDisplay.textContent = "";
            }
        }
    } catch (error) {
        console.error("Fail to Check Authenticate : ", error);
    }
});