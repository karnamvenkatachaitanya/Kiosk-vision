"""
Kiosk Vision – Shop Entry QR Code Generator
Generates a QR code that encodes WiFi credentials + Kiosk URL.
Place this QR code at the shop entrance.
"""

import os
import sys

try:
    import qrcode
except ImportError:
    print("Install qrcode: pip install qrcode[pil]")
    sys.exit(1)

# Configuration
WIFI_SSID = os.getenv("WIFI_SSID", "ShopKiosk")
WIFI_PASSWORD = os.getenv("WIFI_PASSWORD", "")  # Empty for open network
SERVER_IP = os.getenv("SERVER_IP", "192.168.1.10")
KIOSK_URL = f"https://{SERVER_IP}"

# ── Generate WiFi QR ──
wifi_string = f"WIFI:T:WPA;S:{WIFI_SSID};P:{WIFI_PASSWORD};;" if WIFI_PASSWORD else f"WIFI:T:nopass;S:{WIFI_SSID};;"

wifi_qr = qrcode.QRCode(version=1, box_size=12, border=4)
wifi_qr.add_data(wifi_string)
wifi_qr.make(fit=True)
wifi_img = wifi_qr.make_image(fill_color="#0a1628", back_color="white")
wifi_img.save("shop_wifi_qr.png")
print(f"✓ WiFi QR saved: shop_wifi_qr.png")
print(f"  SSID: {WIFI_SSID}")

# ── Generate Kiosk URL QR ──
url_qr = qrcode.QRCode(version=1, box_size=12, border=4)
url_qr.add_data(KIOSK_URL)
url_qr.make(fit=True)
url_img = url_qr.make_image(fill_color="#0a1628", back_color="white")
url_img.save("shop_kiosk_qr.png")
print(f"✓ Kiosk URL QR saved: shop_kiosk_qr.png")
print(f"  URL: {KIOSK_URL}")

print("\n📌 Print both QR codes and place at shop entrance!")
print("   1. Customer scans WiFi QR to connect")
print("   2. Customer scans Kiosk QR to open the app")
