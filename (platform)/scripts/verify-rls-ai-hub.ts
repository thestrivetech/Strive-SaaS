// Verification script for AI-Hub RLS policies
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyRLS() {
  console.log('🔍 Verifying RLS Policies for AI-Hub Tables\n');

  const tables = [
    'ai_agents',
    'agent_teams',
    'team_members',
    'automation_workflows',
    'workflow_executions',
    'agent_executions',
    'team_executions',
    'integrations',
    'workflow_templates'
  ];

  try {
    // Check RLS enabled on tables
    const rlsStatus = await prisma.$queryRaw<Array<{ tablename: string; rowsecurity: boolean }>>`
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE tablename = ANY(${tables})
      ORDER BY tablename
    `;

    console.log('✅ RLS Status:');
    console.table(rlsStatus);

    const enabledCount = rlsStatus.filter(t => t.rowsecurity).length;
    console.log(`\n📊 Tables with RLS enabled: ${enabledCount}/${tables.length}\n`);

    // Check policy count per table
    const policyCounts = await prisma.$queryRaw<Array<{ tablename: string; policy_count: bigint }>>`
      SELECT tablename, COUNT(*) as policy_count
      FROM pg_policies
      WHERE tablename = ANY(${tables})
      GROUP BY tablename
      ORDER BY tablename
    `;

    console.log('📋 Policy Count per Table:');
    console.table(policyCounts.map(p => ({
      tablename: p.tablename,
      policy_count: Number(p.policy_count)
    })));

    const totalPolicies = policyCounts.reduce((sum, p) => sum + Number(p.policy_count), 0);
    console.log(`\n📊 Total Policies Created: ${totalPolicies}\n`);

    // List all policies
    const policies = await prisma.$queryRaw<Array<{ tablename: string; policyname: string; cmd: string }>>`
      SELECT tablename, policyname, cmd
      FROM pg_policies
      WHERE tablename = ANY(${tables})
      ORDER BY tablename, policyname
    `;

    console.log('📝 All Policies:');
    console.table(policies);

    // Verification Summary
    console.log('\n' + '='.repeat(80));
    console.log('VERIFICATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Tables with RLS enabled: ${enabledCount}/9`);
    console.log(`✅ Total policies created: ${totalPolicies}`);
    console.log(`✅ Expected policies: 36 (4 per table × 9 tables)`);
    console.log(`✅ Status: ${totalPolicies === 36 ? 'SUCCESS' : 'NEEDS REVIEW'}`);
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Error verifying RLS:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyRLS();
