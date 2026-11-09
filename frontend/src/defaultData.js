export const DEFAULT_WORKERS = [
  {
    id: 1,
    name: "Maya",
    role: "Housekeeping / Maid",
    phone: "+91 98765 43210",
    avatar_color: "#10b981", // Emerald
  },
  {
    id: 2,
    name: "Anita",
    role: "Chef / Cook",
    phone: "+91 98765 43211",
    avatar_color: "#f59e0b", // Amber
  },
  {
    id: 3,
    name: "Rahul",
    role: "Driver / Errands",
    phone: "+91 98765 43212",
    avatar_color: "#3b82f6", // Blue
  },
  {
    id: 4,
    name: "Suresh",
    role: "Gardener / Maintenance",
    phone: "+91 98765 43213",
    avatar_color: "#84cc16", // Lime
  }
];

export const DEFAULT_TASKS = [
  {
    id: 101,
    title: "Deep Clean Master Suite & Balcony Glass",
    description: "Vacuum silk rugs, sanitize ensuite bathroom, replace bed linen with Egyptian cotton set, clean balcony sliding door glass.",
    category: "Housekeeping",
    room: "Master Suite (2nd Floor)",
    priority: "Urgent",
    due_time: "14:00 Today",
    status: "In Progress",
    assigned_to_id: 1, // Maya
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    started_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    elapsed_seconds: 2700,
    worker_notes: "",
    redo_feedback: "",
    checklist: [
      { id: 1001, item_text: "Vacuum master bedroom & dressing area", is_completed: true },
      { id: 1002, item_text: "Sanitize ensuite bathroom & restock fresh towels", is_completed: true },
      { id: 1003, item_text: "Change bed linens to Egyptian cotton set", is_completed: false },
      { id: 1004, item_text: "Streak-free wipe on balcony glass doors", is_completed: false }
    ],
    audit_logs: [
      { id: 1, action: "Assigned", performed_by: "Owner / Master Admin", remarks: "Assigned to Maya with Urgent priority", timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
      { id: 2, action: "Acknowledged", performed_by: "Maya", remarks: "Opened task in mobile inbox", timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString() },
      { id: 3, action: "Started", performed_by: "Maya", remarks: "Commenced deep cleaning; timer running", timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: 102,
    title: "Prepare 4-Course French Riviera Dinner",
    description: "VIP guests arriving at 20:00. Prepare Bouillabaisse seafood broth, Rosemary Lamb rack, and Crème Brûlée.",
    category: "Culinary",
    room: "Main Kitchen & Pantry",
    priority: "Urgent",
    due_time: "19:30 Today",
    status: "Submitted",
    assigned_to_id: 2, // Anita
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    started_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    submitted_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    elapsed_seconds: 10200,
    worker_notes: "Bouillabaisse simmering on low flame. Lamb racks are seasoned and ready for searing at 19:45. Wine decanted.",
    redo_feedback: "",
    checklist: [
      { id: 2001, item_text: "Inventory organic produce from cellar pantry", is_completed: true },
      { id: 2002, item_text: "Simmer Bouillabaisse seafood stock", is_completed: true },
      { id: 2003, item_text: "Marinate herb-crusted lamb rack", is_completed: true },
      { id: 2004, item_text: "Bake and chill crème brûlée ramekins", is_completed: true }
    ],
    audit_logs: [
      { id: 4, action: "Assigned", performed_by: "Owner / Master Admin", remarks: "VIP dinner prep instructions sent", timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString() },
      { id: 5, action: "Acknowledged", performed_by: "Anita", remarks: "Menu and guest allergies reviewed", timestamp: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString() },
      { id: 6, action: "Started", performed_by: "Anita", remarks: "Kitchen prep in progress", timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString() },
      { id: 7, action: "Submitted", performed_by: "Anita", remarks: "Work done submitted for Owner tasting & inspection", timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: 103,
    title: "Airport VIP Pickup & Dry Cleaning Retrieval",
    description: "Mercedes S-Class must be fueled and detailed. Collect dry cleaning from Park Avenue Cleaners, then meet Flight BA-142 at Terminal 3 at 16:15.",
    category: "Errands & Transport",
    room: "North Gate & Garage",
    priority: "Normal",
    due_time: "15:45 Today",
    status: "Assigned",
    assigned_to_id: 3, // Rahul
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    started_at: null,
    elapsed_seconds: 0,
    worker_notes: "",
    redo_feedback: "",
    checklist: [
      { id: 3001, item_text: "Wash and interior vacuum Mercedes S-Class", is_completed: false },
      { id: 3002, item_text: "Check tire pressures and windshield fluid", is_completed: false },
      { id: 3003, item_text: "Pick up 6 garments from Park Avenue Cleaners", is_completed: false },
      { id: 3004, item_text: "Arrive at Terminal 3 VIP Arrivals parking by 16:15", is_completed: false }
    ],
    audit_logs: [
      { id: 8, action: "Assigned", performed_by: "Owner / Master Admin", remarks: "Flight pickup and errands scheduled", timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: 104,
    title: "Trim Boxwood Hedges & Inspect Sprinklers",
    description: "Formal English garden hedging needs precision squaring. Calibrate zone 4 drip irrigation timers.",
    category: "Landscape & Grounds",
    room: "Formal Garden & Courtyard",
    priority: "Low",
    due_time: "12:00 Today",
    status: "Approved",
    assigned_to_id: 4, // Suresh
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    started_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    submitted_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    elapsed_seconds: 14400,
    worker_notes: "Laser guide used for hedge leveling. Drip line 4 nozzle replaced. Clippings recycled into compost bin.",
    redo_feedback: "",
    checklist: [
      { id: 4001, item_text: "Prune rose garden deadheads", is_completed: true },
      { id: 4002, item_text: "Laser-trim boxwood perimeter", is_completed: true },
      { id: 4003, item_text: "Flush irrigation line 4 & test pressure", is_completed: true }
    ],
    audit_logs: [
      { id: 9, action: "Assigned", performed_by: "Owner / Master Admin", remarks: "Landscape maintenance routine", timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
      { id: 10, action: "Acknowledged", performed_by: "Suresh", remarks: "Tools and trimmer fuel checked", timestamp: new Date(Date.now() - 6.2 * 3600 * 1000).toISOString() },
      { id: 11, action: "Started", performed_by: "Suresh", remarks: "Trimming commenced", timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString() },
      { id: 12, action: "Submitted", performed_by: "Suresh", remarks: "Work completed and grounds raked", timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
      { id: 13, action: "Approved", performed_by: "Property Owner", remarks: "Grounds inspected & approved with praise.", timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString() }
    ]
  }
];

