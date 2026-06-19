import express from 'express';
import cors from 'cors';
import { generateUSAData, generateIndiaData, generateGermanData } from './dataGenerators';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ─── Bank catalog ─────────────────────────────────────────────────────────────

const banks = [
  { id: 'usa-bank', name: 'USA Bank' },
  { id: 'india-bank', name: 'India Bank' },
  { id: 'german-bank', name: 'German Bank' },
];

// Pre-generate data so repeated requests are fast
const bankDataCache: Record<string, ReturnType<typeof generateUSAData>> = {
  'usa-bank': generateUSAData(),
  'india-bank': generateIndiaData(),
  'german-bank': generateGermanData(),
};

// ─── GET /searchResults?q=... ─────────────────────────────────────────────────

app.get('/searchResults', (req, res) => {
  const query = (req.query.q as string || '').toLowerCase().trim();

  const results = query
    ? banks.filter((b) => b.name.toLowerCase().includes(query))
    : banks;

  res.json({ results });
});

// ─── GET /bankresults?bankId=... ──────────────────────────────────────────────

app.get('/bankresults', (req, res) => {
  const bankId = req.query.bankId as string;

  if (!bankId || !bankDataCache[bankId]) {
    res.status(404).json({ error: 'Bank not found' });
    return;
  }

  const bank = banks.find((b) => b.id === bankId);
  const data = bankDataCache[bankId];

  res.json({
    bankName: bank!.name,
    hierarchy: data.hierarchy,
    unassigned: data.unassigned,
  });
});

// ─── POST /publish ────────────────────────────────────────────────────────────

app.post('/publish', (req, res) => {
  const { bankId, nodesById, unassignedBranches } = req.body;
  console.log(`[API POST] Publish changes requested for bankId: ${bankId}`);
  console.log(`- Nodes count: ${nodesById ? Object.keys(nodesById).length : 0}`);
  console.log(`- Unassigned branches count: ${unassignedBranches ? Object.keys(unassignedBranches).length : 0}`);

  // Simulate server processing delay (1.5 seconds)
  setTimeout(() => {
    if (bankId === 'german-bank' && Math.random() < 0.2) {
      // Occasional random error for german-bank to test error handling
      res.status(500).json({ error: 'Simulated publishing failure: Database write deadlock.' });
    } else {
      // Cache the published changes in bankDataCache so they persist on reload (optional, but nice)
      if (bankId && bankDataCache[bankId]) {
        if (nodesById) {
          // Convert record back to array if needed, but our API uses array for hierarchy
          // Let's just update the cached data in-place
          bankDataCache[bankId].hierarchy = Object.values(nodesById);
        }
        if (unassignedBranches) {
          bankDataCache[bankId].unassigned = Object.values(unassignedBranches);
        }
      }
      res.json({ success: true, message: 'Hierarchy changes successfully published to production.' });
    }
  }, 1500);
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✅ Express server running on http://localhost:${PORT}`);
});
