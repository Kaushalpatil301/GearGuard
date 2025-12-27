const db = require('./src/config/db');

async function checkAllData() {
  console.log('\n=== GEARGUARD DATABASE CHECK ===\n');

  try {
    // Total counts
    const requests = await db.query('SELECT COUNT(*) as total FROM maintenance_requests');
    console.log('📊 Total Maintenance Requests:', requests.rows[0].total);

    const equipment = await db.query('SELECT COUNT(*) as total FROM equipment');
    console.log('📊 Total Equipment:', equipment.rows[0].total);

    const teams = await db.query('SELECT COUNT(*) as total FROM teams WHERE is_active = TRUE');
    console.log('📊 Active Teams:', teams.rows[0].total);

    const users = await db.query("SELECT COUNT(*) as total FROM users WHERE role = 'technician' AND is_active = TRUE");
    console.log('📊 Active Technicians:', users.rows[0].total);

    // Requests by Team
    console.log('\n--- Requests by Team ---');
    const teamRequests = await db.query(`
      SELECT 
        t.name as team_name,
        COUNT(mr.id) as total_requests,
        COUNT(CASE WHEN mr.status = 'NEW' THEN 1 END) as new_requests,
        COUNT(CASE WHEN mr.status = 'IN_PROGRESS' THEN 1 END) as in_progress,
        COUNT(CASE WHEN mr.status = 'REPAIRED' THEN 1 END) as repaired,
        COUNT(CASE WHEN mr.status = 'SCRAP' THEN 1 END) as scrap
      FROM teams t
      LEFT JOIN maintenance_requests mr ON t.id = mr.team_id
      WHERE t.is_active = TRUE
      GROUP BY t.name
      ORDER BY total_requests DESC
    `);
    teamRequests.rows.forEach(row => {
      console.log(`  ${row.team_name}: ${row.total_requests} total (${row.new_requests} new, ${row.in_progress} in progress, ${row.repaired} repaired, ${row.scrap} scrap)`);
    });

    // Equipment by Status
    console.log('\n--- Equipment by Status ---');
    const equipmentStatus = await db.query('SELECT status, COUNT(*) as total FROM equipment GROUP BY status ORDER BY total DESC');
    equipmentStatus.rows.forEach(row => {
      console.log(`  ${row.status}: ${row.total}`);
    });

    // Requests by Priority
    console.log('\n--- Requests by Priority ---');
    const priorities = await db.query(`
      SELECT priority, COUNT(*) as total 
      FROM maintenance_requests 
      GROUP BY priority 
      ORDER BY CASE priority 
        WHEN 'CRITICAL' THEN 1 
        WHEN 'HIGH' THEN 2 
        WHEN 'MEDIUM' THEN 3 
        WHEN 'LOW' THEN 4 
      END
    `);
    priorities.rows.forEach(row => {
      console.log(`  ${row.priority}: ${row.total}`);
    });

    // Technician Workload
    console.log('\n--- Technician Workload ---');
    const techWorkload = await db.query(`
      SELECT 
        u.name as technician_name,
        COUNT(ra.id) as total_assignments,
        COUNT(CASE WHEN mr.status = 'IN_PROGRESS' THEN 1 END) as active,
        COUNT(CASE WHEN mr.status = 'REPAIRED' THEN 1 END) as completed
      FROM users u
      LEFT JOIN request_assignments ra ON u.id = ra.assigned_to
      LEFT JOIN maintenance_requests mr ON ra.request_id = mr.id
      WHERE u.role = 'technician' AND u.is_active = TRUE
      GROUP BY u.name
      ORDER BY total_assignments DESC
    `);
    techWorkload.rows.forEach(row => {
      console.log(`  ${row.technician_name}: ${row.total_assignments} total (${row.active} active, ${row.completed} completed)`);
    });

    // SLA Status
    console.log('\n--- SLA Status ---');
    const sla = await db.query(`
      SELECT 
        mr.priority,
        COUNT(mr.id) as total_active,
        COUNT(CASE 
          WHEN (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - mr.created_at)) / 3600) > mr.sla_hours 
          THEN 1 
        END) as breached
      FROM maintenance_requests mr
      WHERE mr.status NOT IN ('REPAIRED', 'SCRAP')
      GROUP BY mr.priority
      ORDER BY CASE mr.priority
        WHEN 'CRITICAL' THEN 1 
        WHEN 'HIGH' THEN 2 
        WHEN 'MEDIUM' THEN 3 
        WHEN 'LOW' THEN 4 
      END
    `);
    sla.rows.forEach(row => {
      console.log(`  ${row.priority}: ${row.breached}/${row.total_active} breached`);
    });

    // Request Aging
    console.log('\n--- Request Aging (Active Only) ---');
    const aging = await db.query(`
      SELECT 
        CASE 
          WHEN EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - created_at)) / 86400 <= 1 THEN '0-1 days'
          WHEN EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - created_at)) / 86400 <= 3 THEN '1-3 days'
          WHEN EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - created_at)) / 86400 <= 7 THEN '3-7 days'
          WHEN EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - created_at)) / 86400 <= 14 THEN '1-2 weeks'
          WHEN EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - created_at)) / 86400 <= 30 THEN '2-4 weeks'
          ELSE '30+ days'
        END as age_bucket,
        COUNT(*) as request_count
      FROM maintenance_requests
      WHERE status NOT IN ('REPAIRED', 'SCRAP')
      GROUP BY age_bucket
      ORDER BY 
        CASE age_bucket
          WHEN '0-1 days' THEN 1
          WHEN '1-3 days' THEN 2
          WHEN '3-7 days' THEN 3
          WHEN '1-2 weeks' THEN 4
          WHEN '2-4 weeks' THEN 5
          WHEN '30+ days' THEN 6
        END
    `);
    aging.rows.forEach(row => {
      console.log(`  ${row.age_bucket}: ${row.request_count} requests`);
    });

    console.log('\n=== CHECK COMPLETE ===\n');
    process.exit(0);

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

checkAllData();
