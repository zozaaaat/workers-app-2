"""
Performance Testing and Monitoring Script
نص اختبار ومراقبة الأداء
"""

import time
import asyncio
import aiohttp
import psutil
import statistics
from datetime import datetime
from typing import List, Dict, Any
import json

class PerformanceTester:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.results = {}
        
    async def test_api_endpoint(self, session: aiohttp.ClientSession, endpoint: str, method: str = "GET") -> Dict[str, Any]:
        """اختبار أداء نقطة API واحدة"""
        url = f"{self.base_url}{endpoint}"
        times = []
        errors = 0
        
        for i in range(10):  # 10 طلبات لكل endpoint
            try:
                start_time = time.time()
                async with session.request(method, url) as response:
                    await response.text()
                    end_time = time.time()
                    times.append(end_time - start_time)
            except Exception as e:
                errors += 1
                print(f"خطأ في {endpoint}: {e}")
        
        if times:
            return {
                "endpoint": endpoint,
                "avg_response_time": statistics.mean(times),
                "min_response_time": min(times),
                "max_response_time": max(times),
                "median_response_time": statistics.median(times),
                "errors": errors,
                "success_rate": ((10 - errors) / 10) * 100
            }
        else:
            return {
                "endpoint": endpoint,
                "error": "جميع الطلبات فشلت",
                "errors": errors
            }
    
    async def test_dashboard_performance(self):
        """اختبار أداء لوحة التحكم"""
        print("🧪 اختبار أداء لوحة التحكم...")
        
        async with aiohttp.ClientSession() as session:
            endpoints = [
                "/api/v1/dashboard/stats",
                "/api/v1/dashboard/notifications?limit=10",
                "/api/v1/dashboard/expiring-documents?days_ahead=30",
                "/api/v1/dashboard/workers-optimized?limit=20",
                "/api/v1/dashboard/performance-info"
            ]
            
            tasks = [self.test_api_endpoint(session, endpoint) for endpoint in endpoints]
            results = await asyncio.gather(*tasks)
            
            self.results["dashboard"] = results
            
            # طباعة النتائج
            print("\n📊 نتائج اختبار الأداء:")
            print("-" * 50)
            for result in results:
                if "error" not in result:
                    print(f"🔗 {result['endpoint']}")
                    print(f"   ⏱️  متوسط وقت الاستجابة: {result['avg_response_time']*1000:.2f} ms")
                    print(f"   ✅ معدل النجاح: {result['success_rate']:.1f}%")
                    print(f"   📈 أسرع استجابة: {result['min_response_time']*1000:.2f} ms")
                    print(f"   📉 أبطأ استجابة: {result['max_response_time']*1000:.2f} ms")
                else:
                    print(f"❌ {result['endpoint']}: {result['error']}")
                print()
    
    def test_system_resources(self):
        """اختبار موارد النظام"""
        print("💻 فحص موارد النظام...")
        
        # معلومات الذاكرة
        memory = psutil.virtual_memory()
        
        # معلومات المعالج
        cpu_percent = psutil.cpu_percent(interval=1)
        
        # معلومات القرص
        disk = psutil.disk_usage('/')
        
        system_info = {
            "memory": {
                "total_gb": round(memory.total / (1024**3), 2),
                "available_gb": round(memory.available / (1024**3), 2),
                "used_percent": memory.percent
            },
            "cpu": {
                "usage_percent": cpu_percent,
                "cores": psutil.cpu_count()
            },
            "disk": {
                "total_gb": round(disk.total / (1024**3), 2),
                "free_gb": round(disk.free / (1024**3), 2),
                "used_percent": round(((disk.total - disk.free) / disk.total) * 100, 2)
            }
        }
        
        self.results["system"] = system_info
        
        print(f"💾 الذاكرة: {system_info['memory']['used_percent']:.1f}% مستخدمة")
        print(f"🖥️  المعالج: {system_info['cpu']['usage_percent']:.1f}% مستخدم")
        print(f"💽 القرص: {system_info['disk']['used_percent']:.1f}% مستخدم")
        print()
    
    async def test_concurrent_requests(self):
        """اختبار الطلبات المتزامنة"""
        print("🚀 اختبار الطلبات المتزامنة...")
        
        async def make_request(session, url):
            try:
                start = time.time()
                async with session.get(url) as response:
                    await response.text()
                    return time.time() - start
            except:
                return None
        
        async with aiohttp.ClientSession() as session:
            # 50 طلب متزامن للإحصائيات
            url = f"{self.base_url}/api/v1/dashboard/stats"
            tasks = [make_request(session, url) for _ in range(50)]
            
            start_time = time.time()
            results = await asyncio.gather(*tasks)
            total_time = time.time() - start_time
            
            successful_requests = [r for r in results if r is not None]
            
            if successful_requests:
                self.results["concurrent"] = {
                    "total_requests": 50,
                    "successful_requests": len(successful_requests),
                    "total_time": total_time,
                    "avg_response_time": statistics.mean(successful_requests),
                    "requests_per_second": len(successful_requests) / total_time
                }
                
                print(f"📊 طلبات ناجحة: {len(successful_requests)}/50")
                print(f"⏱️  إجمالي الوقت: {total_time:.2f} ثانية")
                print(f"🚀 طلبات في الثانية: {len(successful_requests) / total_time:.2f}")
                print(f"📈 متوسط وقت الاستجابة: {statistics.mean(successful_requests)*1000:.2f} ms")
            else:
                print("❌ جميع الطلبات المتزامنة فشلت")
        print()
    
    def check_redis_performance(self):
        """فحص أداء Redis"""
        try:
            import redis
            r = redis.Redis(host='localhost', port=6379, db=0)
            
            # اختبار كتابة وقراءة
            start = time.time()
            for i in range(1000):
                r.set(f"test_key_{i}", f"test_value_{i}")
            write_time = time.time() - start
            
            start = time.time()
            for i in range(1000):
                r.get(f"test_key_{i}")
            read_time = time.time() - start
            
            # تنظيف البيانات التجريبية
            for i in range(1000):
                r.delete(f"test_key_{i}")
            
            self.results["redis"] = {
                "write_time_1000_keys": write_time,
                "read_time_1000_keys": read_time,
                "write_ops_per_second": 1000 / write_time,
                "read_ops_per_second": 1000 / read_time,
                "connected": True
            }
            
            print("📦 اختبار أداء Redis:")
            print(f"   ✍️  كتابة 1000 مفتاح: {write_time:.3f} ثانية")
            print(f"   📖 قراءة 1000 مفتاح: {read_time:.3f} ثانية")
            print(f"   🚀 عمليات كتابة/ثانية: {1000/write_time:.0f}")
            print(f"   🚀 عمليات قراءة/ثانية: {1000/read_time:.0f}")
            
        except ImportError:
            print("⚠️  Redis غير مثبت")
            self.results["redis"] = {"error": "Redis not installed"}
        except Exception as e:
            print(f"❌ خطأ في اتصال Redis: {e}")
            self.results["redis"] = {"error": str(e)}
        print()
    
    def generate_report(self):
        """إنشاء تقرير شامل للأداء"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"performance_report_{timestamp}.json"
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump({
                "timestamp": datetime.now().isoformat(),
                "results": self.results
            }, f, indent=2, ensure_ascii=False)
        
        print(f"📋 تم حفظ التقرير في: {filename}")
        
        # تقييم الأداء العام
        print("\n🎯 تقييم الأداء العام:")
        print("-" * 30)
        
        # فحص أوقات الاستجابة
        if "dashboard" in self.results:
            avg_times = [r.get("avg_response_time", 999) for r in self.results["dashboard"] if "avg_response_time" in r]
            if avg_times:
                overall_avg = statistics.mean(avg_times)
                if overall_avg < 0.2:  # أقل من 200ms
                    print("✅ أوقات الاستجابة: ممتازة")
                elif overall_avg < 0.5:  # أقل من 500ms
                    print("🟡 أوقات الاستجابة: جيدة")
                else:
                    print("🔴 أوقات الاستجابة: تحتاج تحسين")
        
        # فحص موارد النظام
        if "system" in self.results:
            memory_usage = self.results["system"]["memory"]["used_percent"]
            cpu_usage = self.results["system"]["cpu"]["usage_percent"]
            
            if memory_usage < 70 and cpu_usage < 70:
                print("✅ موارد النظام: مستقرة")
            elif memory_usage < 85 and cpu_usage < 85:
                print("🟡 موارد النظام: مقبولة")
            else:
                print("🔴 موارد النظام: مرتفعة")
        
        return filename

async def main():
    """الدالة الرئيسية لاختبار الأداء"""
    print("🔍 بدء اختبار الأداء الشامل...")
    print("=" * 50)
    
    tester = PerformanceTester()
    
    # اختبار موارد النظام
    tester.test_system_resources()
    
    # اختبار Redis
    tester.check_redis_performance()
    
    # اختبار أداء API
    await tester.test_dashboard_performance()
    
    # اختبار الطلبات المتزامنة
    await tester.test_concurrent_requests()
    
    # إنشاء التقرير
    report_file = tester.generate_report()
    
    print("\n✅ انتهى اختبار الأداء بنجاح!")
    print(f"📊 راجع التقرير الشامل في: {report_file}")

if __name__ == "__main__":
    asyncio.run(main())
