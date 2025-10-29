"use client";
import React, { useState, useEffect } from "react";
import { useBackend } from "@/contexts/BackendContext";

type TestResult = {
  name: string;
  status: "success" | "error" | "loading" | "pending";
  message?: string;
  data?: any;
  duration?: number;
};

type TestCategory = {
  name: string;
  description: string;
  tests: TestResult[];
  color: string;
  icon: React.ReactNode;
};

const TestIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const SecurityIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

const ServerIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"
    />
  </svg>
);

const CommunicationIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

function TestResult({ result }: { result: TestResult }) {
  const getStatusColor = () => {
    switch (result.status) {
      case "success":
        return "text-green-600 bg-green-50 border-green-200";
      case "error":
        return "text-red-600 bg-red-50 border-red-200";
      case "loading":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = () => {
    switch (result.status) {
      case "success":
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case "error":
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      case "loading":
        return (
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        );
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
    }
  };

  return (
    <div className={`border rounded-lg p-3 ${getStatusColor()}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {getStatusIcon()}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{result.name}</p>
            {result.message && (
              <p className="text-xs mt-1 opacity-80">{result.message}</p>
            )}
            {result.data && (
              <details className="mt-2">
                <summary className="text-xs cursor-pointer hover:underline">
                  Yanıt Detayları
                </summary>
                <pre className="text-xs mt-1 p-2 bg-black/10 rounded overflow-auto max-h-24">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
        {result.duration && (
          <span className="text-xs opacity-60">{result.duration}ms</span>
        )}
      </div>
    </div>
  );
}

function TestCategory({
  category,
  onRunTests,
}: {
  category: TestCategory;
  onRunTests: () => void;
}) {
  const successCount = category.tests.filter(
    (t) => t.status === "success"
  ).length;
  const errorCount = category.tests.filter((t) => t.status === "error").length;
  const loadingCount = category.tests.filter(
    (t) => t.status === "loading"
  ).length;
  const totalTests = category.tests.length;

  return (
    <div className="bg-card rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${category.color}`}>
            {category.icon}
          </div>
          <div>
            <h3 className="font-bold text-foreground">{category.name}</h3>
            <p className="text-sm text-muted-foreground">
              {category.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm">
              <span className="text-green-600 font-medium">{successCount}</span>{" "}
              /<span className="text-red-600 font-medium">{errorCount}</span> /
              <span className="font-medium">{totalTests}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              başarılı/hata/toplam
            </div>
          </div>
          <button
            onClick={onRunTests}
            disabled={loadingCount > 0}
            className="btn btn-primary btn-sm"
          >
            {loadingCount > 0 ? "Test Ediliyor..." : "Testleri Çalıştır"}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {category.tests.map((test, index) => (
          <TestResult key={index} result={test} />
        ))}
      </div>
    </div>
  );
}

export default function MicroserviceTestPage() {
  const { apiUrl } = useBackend();
  const [testCategories, setTestCategories] = useState<TestCategory[]>([
    {
      name: "API Gateway",
      description: "Public endpoint testleri",
      color: "bg-blue-100 text-blue-600",
      icon: <ServerIcon />,
      tests: [
        { name: "Health Check", status: "pending" },
        { name: "Sessions Endpoint", status: "pending" },
        { name: "Models Endpoint", status: "pending" },
        { name: "Documents List Endpoint", status: "pending" },
      ],
    },
    {
      name: "Mikroservis İletişimi",
      description: "Servisler arası iletişim testleri",
      color: "bg-green-100 text-green-600",
      icon: <CommunicationIcon />,
      tests: [
        { name: "API Gateway → Model Inference", status: "pending" },
        { name: "API Gateway → Document Processing", status: "pending" },
      ],
    },
    {
      name: "Güvenlik Testleri",
      description: "Private servis erişim kontrolleri",
      color: "bg-purple-100 text-purple-600",
      icon: <SecurityIcon />,
      tests: [
        { name: "PDF Processor (403 bekleniyor)", status: "pending" },
        { name: "Model Inferencer (403 bekleniyor)", status: "pending" },
        { name: "ChromaDB (403 bekleniyor)", status: "pending" },
      ],
    },
  ]);

  const [overallResults, setOverallResults] = useState({
    totalTests: 0,
    successfulTests: 0,
    failedTests: 0,
    successRate: 0,
  });

  const runTest = async (
    name: string,
    url: string,
    expectStatus = 200
  ): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
      });

      const duration = Date.now() - startTime;
      const isSuccess = response.status === expectStatus;

      let data = null;
      try {
        if (
          response.headers.get("content-type")?.includes("application/json")
        ) {
          data = await response.json();
        } else {
          const text = await response.text();
          data = text.substring(0, 200) + (text.length > 200 ? "..." : "");
        }
      } catch (e) {
        data = `Response parsing error: ${e}`;
      }

      return {
        name,
        status: isSuccess ? "success" : "error",
        message: `Status: ${response.status} ${response.statusText}${
          isSuccess ? " ✓" : " ✗"
        }`,
        data,
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      return {
        name,
        status: "error",
        message: `Network Error: ${error.message}`,
        duration,
      };
    }
  };

  const runApiGatewayTests = async () => {
    const categoryIndex = 0;

    // Set loading states
    setTestCategories((prev) => {
      const updated = [...prev];
      updated[categoryIndex].tests = updated[categoryIndex].tests.map(
        (test) => ({
          ...test,
          status: "loading",
        })
      );
      return updated;
    });

    const tests = [
      { name: "Health Check", url: `${apiUrl}/health` },
      { name: "Sessions Endpoint", url: `${apiUrl}/sessions` },
      { name: "Models Endpoint", url: `${apiUrl}/models` },
      {
        name: "Documents List Endpoint",
        url: `${apiUrl}/documents/list-markdown`,
      },
    ];

    for (let i = 0; i < tests.length; i++) {
      const result = await runTest(tests[i].name, tests[i].url);

      setTestCategories((prev) => {
        const updated = [...prev];
        updated[categoryIndex].tests[i] = result;
        return updated;
      });
    }
  };

  const runCommunicationTests = async () => {
    const categoryIndex = 1;

    // Set loading states
    setTestCategories((prev) => {
      const updated = [...prev];
      updated[categoryIndex].tests = updated[categoryIndex].tests.map(
        (test) => ({
          ...test,
          status: "loading",
        })
      );
      return updated;
    });

    const tests = [
      { name: "API Gateway → Model Inference", url: `${apiUrl}/models` },
      {
        name: "API Gateway → Document Processing",
        url: `${apiUrl}/documents/list-markdown`,
      },
    ];

    for (let i = 0; i < tests.length; i++) {
      const result = await runTest(tests[i].name, tests[i].url);

      setTestCategories((prev) => {
        const updated = [...prev];
        updated[categoryIndex].tests[i] = result;
        return updated;
      });
    }
  };

  const runSecurityTests = async () => {
    const categoryIndex = 2;

    // Set loading states
    setTestCategories((prev) => {
      const updated = [...prev];
      updated[categoryIndex].tests = updated[categoryIndex].tests.map(
        (test) => ({
          ...test,
          status: "loading",
        })
      );
      return updated;
    });

    const privateServices = [
      {
        name: "PDF Processor (403 bekleniyor)",
        url: "https://pdf-processor-1051060211087.europe-west1.run.app/health",
      },
      {
        name: "Model Inferencer (403 bekleniyor)",
        url: "https://model-inferencer-1051060211087.europe-west1.run.app/health",
      },
      {
        name: "ChromaDB (403 bekleniyor)",
        url: "https://chromadb-1051060211087.europe-west1.run.app/api/v1/heartbeat",
      },
    ];

    for (let i = 0; i < privateServices.length; i++) {
      const result = await runTest(
        privateServices[i].name,
        privateServices[i].url,
        403
      );

      setTestCategories((prev) => {
        const updated = [...prev];
        updated[categoryIndex].tests[i] = result;
        return updated;
      });
    }
  };

  const runAllTests = async () => {
    await Promise.all([
      runApiGatewayTests(),
      runCommunicationTests(),
      runSecurityTests(),
    ]);
  };

  // Update overall results when test categories change
  useEffect(() => {
    const totalTests = testCategories.reduce(
      (acc, cat) => acc + cat.tests.length,
      0
    );
    const successfulTests = testCategories.reduce(
      (acc, cat) =>
        acc + cat.tests.filter((test) => test.status === "success").length,
      0
    );
    const failedTests = testCategories.reduce(
      (acc, cat) =>
        acc + cat.tests.filter((test) => test.status === "error").length,
      0
    );
    const successRate =
      totalTests > 0 ? (successfulTests / totalTests) * 100 : 0;

    setOverallResults({
      totalTests,
      successfulTests,
      failedTests,
      successRate,
    });
  }, [testCategories]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          🧪 Mikroservis Test Dashboard
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          RAG3 mikroservis mimarisinin tüm bileşenlerini test ederek sistem
          sağlığını kontrol edin. API Gateway, mikroservis iletişimi ve güvenlik
          ayarları detaylı olarak test edilir.
        </p>
      </div>

      {/* Overall Results */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {overallResults.totalTests}
            </div>
            <div className="text-sm text-muted-foreground">Toplam Test</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {overallResults.successfulTests}
            </div>
            <div className="text-sm text-muted-foreground">Başarılı</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {overallResults.failedTests}
            </div>
            <div className="text-sm text-muted-foreground">Başarısız</div>
          </div>
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${
                overallResults.successRate >= 90
                  ? "text-green-600"
                  : overallResults.successRate >= 70
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {overallResults.successRate.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Başarı Oranı</div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button onClick={runAllTests} className="btn btn-primary btn-lg">
            <TestIcon />
            <span className="ml-2">Tüm Testleri Çalıştır</span>
          </button>
        </div>
      </div>

      {/* Test Categories */}
      <div className="space-y-6">
        {testCategories.map((category, index) => (
          <TestCategory
            key={index}
            category={category}
            onRunTests={
              index === 0
                ? runApiGatewayTests
                : index === 1
                ? runCommunicationTests
                : runSecurityTests
            }
          />
        ))}
      </div>

      {/* System Status */}
      <div className="bg-card rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">
          Sistem Durumu
        </h3>

        {overallResults.successRate >= 90 ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <h4 className="font-medium text-green-800">
                  🎉 Tüm Sistemler Çalışıyor!
                </h4>
                <p className="text-sm text-green-700">
                  Mikroservis mimarisi optimal durumda.
                </p>
              </div>
            </div>
          </div>
        ) : overallResults.successRate >= 70 ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
              <div>
                <h4 className="font-medium text-yellow-800">
                  ⚠️ Sistem Çoğunlukla Çalışıyor
                </h4>
                <p className="text-sm text-yellow-700">
                  Bazı servisler problem yaşayabilir. Kontrol edin.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
              <div>
                <h4 className="font-medium text-red-800">
                  🚨 Sistem Sorunları Tespit Edildi
                </h4>
                <p className="text-sm text-red-700">
                  Çoklu servis hatası. Immediate müdahale gerekli.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            <strong>API Endpoint:</strong> {apiUrl}
          </p>
          <p>
            <strong>Son Test:</strong> {new Date().toLocaleString("tr-TR")}
          </p>
        </div>
      </div>
    </div>
  );
}
