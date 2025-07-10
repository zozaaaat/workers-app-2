import sqlite3
import json

def check_licenses_table():
    try:
        conn = sqlite3.connect('workers.db')
        cursor = conn.cursor()
        
        # فحص هيكل الجدول
        cursor.execute('PRAGMA table_info(licenses)')
        columns = cursor.fetchall()
        
        print("🔍 أعمدة جدول التراخيص:")
        print("=" * 50)
        for col in columns:
            print(f"- {col[1]} ({col[2]})")
        
        # عدد الصفوف
        cursor.execute('SELECT COUNT(*) FROM licenses')
        count = cursor.fetchone()[0]
        print(f"\n📊 عدد التراخيص في قاعدة البيانات: {count}")
        
        # عينة من البيانات
        if count > 0:
            cursor.execute('SELECT * FROM licenses LIMIT 3')
            rows = cursor.fetchall()
            print("\n📝 عينة من البيانات:")
            print("=" * 50)
            column_names = [description[0] for description in cursor.description]
            for i, row in enumerate(rows, 1):
                print(f"\nترخيص #{i}:")
                for j, value in enumerate(row):
                    if value is not None:
                        print(f"  {column_names[j]}: {value}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ خطأ في الاتصال بقاعدة البيانات: {e}")
        return False

if __name__ == "__main__":
    check_licenses_table()
