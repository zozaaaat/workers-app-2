
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../api";

const WorkerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [worker, setWorker] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    
    // جلب بيانات العامل
    setLoading(true);
    axios.get(`${API_URL}/workers/api/worker/${id}`)
      .then(res => {
        if (res.data.error) {
          setError(res.data.error);
        } else {
          setWorker(res.data);
        }
      })
      .catch(() => setError("خطأ في جلب بيانات العامل"))
      .finally(() => setLoading(false));
    
    // جلب مستندات العامل
    axios.get(`${API_URL}/worker_documents/api/docs/${id}`)
      .then(res => {
        if (res.data.error) {
          console.log("Documents error:", res.data.error);
          setDocuments([]);
        } else {
          setDocuments(res.data);
        }
      })
      .catch(err => {
        console.log("Documents fetch error:", err);
        setDocuments([]);
      });
  }, [id]);

  if (loading) return <div>جاري التحميل...</div>;
  if (error) return <div>خطأ: {error}</div>;
  if (!worker) return <div>العامل غير موجود</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>ملف العامل</h1>
      
      <div style={{ marginBottom: "20px", padding: "15px", border: "1px solid #ddd", borderRadius: "5px" }}>
        <h2>البيانات الأساسية</h2>
        <p><strong>الاسم:</strong> {worker.name || "غير متوفر"}</p>
        <p><strong>الرقم المدني:</strong> {worker.civil_id || "غير متوفر"}</p>
        <p><strong>الجنسية:</strong> {worker.nationality || "غير متوفر"}</p>
        <p><strong>المسمى الوظيفي:</strong> {worker.job_title || "غير متوفر"}</p>
        <p><strong>تاريخ التوظيف:</strong> {worker.hire_date || "غير متوفر"}</p>
        <p><strong>الهاتف:</strong> {worker.phone || "غير متوفر"}</p>
        <p><strong>الرقم المخصص:</strong> {worker.custom_id || "غير متوفر"}</p>
      </div>

      <div style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "5px" }}>
        <h2>المستندات ({documents.length})</h2>
        {documents.length > 0 ? (
          <ul>
            {documents.map((doc, index) => (
              <li key={index} style={{ marginBottom: "10px" }}>
                <strong>{doc.filename}</strong> - {doc.doc_type} 
                {doc.description && <span> ({doc.description})</span>}
                {doc.upload_date && <span> - {new Date(doc.upload_date).toLocaleDateString()}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p>لا توجد مستندات مرفوعة</p>
        )}
      </div>
    </div>
  );
};

export default WorkerProfilePage;
