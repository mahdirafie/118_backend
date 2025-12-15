export const smsConfig = {
    username: "miladloveboth",
    password: "0622176364Milad",
    baseUrl: "http://smspanel.Trez.ir/SendMessageWithCode.ashx",
};

export async function sendSMS(phone: string, message: string): Promise<string> {
    const formData = new URLSearchParams({
        UserName: smsConfig.username,
        Password: smsConfig.password,
        Mobile: phone,
        Message: message,
    });

    try {
        const response = await fetch(smsConfig.baseUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData.toString(),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`SMS request failed with status ${response.status}: ${text}`);
        }

        return await response.text();
    } catch (error) {
        console.error("SMS Request Error:", error);
        throw error;
    }
}
