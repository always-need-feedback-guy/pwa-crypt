async function encryptAndSave() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) return alert("Select a file");

    const passphrase = prompt("Enter strong passphrase:");
    if (!passphrase) return;

    const status = document.getElementById('status');
    status.textContent = "Encrypting...";

    const reader = new FileReader();
    reader.onload = async function(e) {
        const data = new Uint8Array(e.target.result);
        
        // Simple but strong browser encryption (Web Crypto API)
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            "raw", encoder.encode(passphrase), { name: "PBKDF2" }, false, ["deriveBits", "deriveKey"]
        );
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const key = await crypto.subtle.deriveKey(
            { name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" },
            keyMaterial, { name: "AES-GCM", length: 256 }, false, ["encrypt"]
        );

        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, data);

        // Save as .enc file
        const blob = new Blob([salt, iv, new Uint8Array(encrypted)], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name + '.enc';
        a.click();

        status.textContent = "Encrypted file saved!";
    };
    reader.readAsArrayBuffer(file);
}
