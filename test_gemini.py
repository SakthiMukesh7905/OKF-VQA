import os
import json
import urllib.request
import urllib.error

# Replace with your actual Gemini API key for local testing
GEMINI_API_KEY = "AQ.Ab8RN6JqOfm4tZNllXwdpV17SxbJp4HlKeaJjL8tfjZF_g6k5w"

def call_gemini_api(prompt, text_context):
    """
    Sends the user query and pre-filtered context to the Gemini API via REST.
    """
    api_key = GEMINI_API_KEY
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable is missing.")
        return "Failed to synthesize medical diagnosis from allowed context."

    # Updated URL with a current production model name
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent"

    full_prompt = f"""You are a specialized Medical Visual Question Answering Assistant.
Answer the clinical question strictly using the provided approved context.

APPROVED MEDICAL CONTEXT:
{text_context}

USER QUERY:
{prompt}"""

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": full_prompt}
                ]
            }
        ]
    }

    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": api_key
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST"
    )

    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            
            candidates = res_data.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts and "text" in parts[0]:
                    return parts[0]["text"]
            
            print(f"Gemini API returned unparseable content or was blocked: {res_data}")
            return "Failed to synthesize medical diagnosis from allowed context."

    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f"Gemini API HTTPError [{e.code}]: {error_body}")
        return "Failed to synthesize medical diagnosis from allowed context."
    except Exception as e:
        print(f"Gemini API Unexpected Error: {e}")
        return "Failed to synthesize medical diagnosis from allowed context."

if __name__ == "__main__":
    call_gemini_api("hi","insomnia")