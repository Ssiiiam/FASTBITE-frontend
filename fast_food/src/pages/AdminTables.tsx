import { useEffect, useState } from "react";
import api from "../api/axios";
import "./AdminTables.css";

interface Table {
  id: number;
  table_number: number;
  capacity: number;
  status: "available" | "occupied" | "reserved";
}

interface QRData {
  table: {
    id: number;
    table_number: number;
  };
  url: string;
  qr_code: string;
}

export default function AdminTables() {
  const [tables, setTables] = useState<Table[]>([]);
  const [qrCodes, setQrCodes] = useState<Record<number, QRData>>({});
  const [loading, setLoading] = useState(true);
  const [generatingTableId, setGeneratingTableId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await api.get("/tables");
        setTables(response.data.tables);
      } catch (error) {
        console.error("Failed to load tables:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchTables();
  }, []);

  const generateQR = async (tableId: number) => {
    try {
      setGeneratingTableId(tableId);

      const response = await api.get<QRData>(`/tables/${tableId}/qr`);

      setQrCodes((previous) => ({
        ...previous,
        [tableId]: response.data,
      }));
    } catch (error) {
      console.error("Failed to generate QR:", error);
    } finally {
      setGeneratingTableId(null);
    }
  };

  if (loading) {
    return (
      <main className="admin-tables-page">
        <p className="admin-tables-message">Loading tables...</p>
      </main>
    );
  }

  return (
    <main className="admin-tables-page">
      <div className="admin-tables-container">
        <header className="admin-tables-header">
          <span className="admin-tables-label">FASTBITE MANAGEMENT</span>
          <h1>Restaurant Tables</h1>
          <p>Manage restaurant seating and generate table QR codes.</p>
        </header>

        <section className="admin-tables-summary">
          <div className="admin-table-summary-card">
            <span>Total Tables</span>
            <strong>{tables.length}</strong>
          </div>

          <div className="admin-table-summary-card">
            <span>Available</span>
            <strong>
              {tables.filter((table) => table.status === "available").length}
            </strong>
          </div>

          <div className="admin-table-summary-card">
            <span>Occupied</span>
            <strong>
              {tables.filter((table) => table.status === "occupied").length}
            </strong>
          </div>

          <div className="admin-table-summary-card">
            <span>Reserved</span>
            <strong>
              {tables.filter((table) => table.status === "reserved").length}
            </strong>
          </div>
        </section>

        {tables.length === 0 ? (
          <div className="admin-tables-empty">
            <span>🪑</span>
            <h2>No Tables Found</h2>
            <p>Restaurant tables will appear here.</p>
          </div>
        ) : (
          <section className="admin-tables-grid">
            {tables.map((table) => (
              <article className="admin-table-card" key={table.id}>
                <div className="admin-table-card-top">
                  <div className="admin-table-icon">🪑</div>

                  <span className={`admin-table-status status-${table.status}`}>
                    {table.status}
                  </span>
                </div>

                <h2>Table {table.table_number}</h2>

                <p className="admin-table-capacity">
                  <span>Capacity</span>
                  <strong>{table.capacity} people</strong>
                </p>

                <button
                  type="button"
                  className="admin-table-qr-button"
                  onClick={() => void generateQR(table.id)}
                  disabled={generatingTableId !== null}
                >
                  {generatingTableId === table.id
                    ? "Generating..."
                    : qrCodes[table.id]
                      ? "Regenerate QR"
                      : "Generate QR"}
                </button>

                {qrCodes[table.id] && (
                  <div className="admin-table-qr-result">
                    <img
                      src={qrCodes[table.id].qr_code}
                      alt={`QR code for table ${table.table_number}`}
                    />

                    <p>Scan to open this table's menu.</p>

                    <a
                      href={qrCodes[table.id].url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open table link
                    </a>
                  </div>
                )}
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
