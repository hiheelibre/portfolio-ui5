require("dotenv").config();

async function main() {
    const buildHookUrl = process.env.NETLIFY_BUILD_HOOK_URL;

    if (!buildHookUrl) {
        throw new Error("NETLIFY_BUILD_HOOK_URL이 없습니다. .env 파일을 확인하세요.");
    }

    console.log("[Netlify Build Hook] 재배포 요청 시작");

    const response = await fetch(buildHookUrl, {
        method: "POST"
    });

    if (!response.ok) {
        const text = await response.text();

        throw new Error(
            "Netlify Build Hook 호출 실패: " +
            response.status +
            " " +
            response.statusText +
            "\n" +
            text
        );
    }

    console.log("[Netlify Build Hook] 재배포 요청 완료");
    console.log("[Netlify Build Hook] Netlify Deploys 화면에서 진행 상태를 확인하세요.");
}

main().catch((error) => {
    console.error("[Netlify Build Hook] 실패:", error.message || error);
    process.exit(1);
});