import pandas as pd
import requests
import re

def extract_coordinates(url):
    try:
        # 1. متابعة إعادة التوجيه للحصول على الرابط النهائي
        # Setting a timeout is good practice to prevent the script from hanging
        response = requests.get(url, allow_redirects=True, timeout=10)
        final_url = response.url

        # 2. البحث عن الإحداثيات في الرابط النهائي
        # النمط الأكثر شيوعًا: @latitude,longitude,zoom
        match_at_coords = re.search(r"@([-+]?\d+\.\d+),([-+]?\d+\.\d+)", final_url)
        if match_at_coords:
            latitude = float(match_at_coords.group(1))
            longitude = float(match_at_coords.group(2))
            return latitude, longitude

        # نمط آخر قد يظهر في روابط البحث أو الروابط الأقدم: q=latitude,longitude
        match_q_coords = re.search(r"q=([-+]?\d+\.\d+),([-+]?\d+\.\d+)", final_url)
        if match_q_coords:
            latitude = float(match_q_coords.group(1))
            longitude = float(match_q_coords.group(2))
            return latitude, longitude

        # إذا لم يتم العثور على أي نمط
        print(f"Could not extract coordinates from final URL: {final_url}")
        return None, None
    except requests.exceptions.RequestException as e:
        print(f"Error accessing URL {url}: {e}")
        return None, None
    except Exception as e:
        print(f"An unexpected error occurred for URL {url}: {e}")
        return None, None

# تحميل ملف CSV
# تأكد أن اسم الملف والمسار صحيحان
df = pd.read_csv(r"E:\dev\UberFix.shop\public\data\branch_locations.csv", encoding="ISO-8859-1")

latitudes = []
longitudes = []

# التكرار عبر الصفوف وتطبيق الدالة
for index, row in df.iterrows():
    # تأكد من أن اسم العمود الذي يحتوي على الروابط هو "link"
    # وإلا قم بتعديله إلى الاسم الصحيح، مثلاً row["Google Maps Link"]
    url = row["link"]
    print(f"Processing URL: {url}")
    lat, lng = extract_coordinates(url)
    latitudes.append(lat)
    longitudes.append(lng)

# إضافة الأعمدة الجديدة إلى DataFrame
df["latitude"] = latitudes
df["longitude"] = longitudes

# حفظ DataFrame المعدل إلى ملف CSV جديد
output_filepath = r"E:\dev\UberFix.shop\public\data\branch_locations_fixed.csv"
df.to_csv(output_filepath, index=False, encoding="utf-8")
print(f"Processing complete. Results saved to: {output_filepath}")

