import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { employeeService } from '../services/api';
import type { Employee } from '../types';

interface OrgNode {
  id: number;
  name: string;
  jobTitle: string;
  department: string;
  role: string;
  children?: OrgNode[];
}

function buildTree(employees: Employee[]): OrgNode[] {
  const map = new Map<number, OrgNode>();
  employees.forEach((e) => {
    map.set(e.id, {
      id: e.id,
      name: e.name,
      jobTitle: e.jobTitle,
      department: e.department?.name ?? '',
      role: e.role,
      children: [],
    });
  });

  const roots: OrgNode[] = [];
  employees.forEach((e) => {
    const node = map.get(e.id)!;
    if (e.managerId && map.has(e.managerId)) {
      map.get(e.managerId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

const roleColors: Record<string, string> = {
  HR_ADMIN: '#3b82f6',
  MANAGER: '#8b5cf6',
  EMPLOYEE: '#10b981',
};

export default function OrgChart() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    employeeService
      .getAll()
      .then((employees) => {
        const roots = buildTree(employees);
        const root = roots.length === 1 ? roots[0] : { id: 0, name: 'Organization', jobTitle: '', department: '', role: 'HR_ADMIN', children: roots };
        drawChart(root);
      })
      .catch(() => setError('Failed to load org chart'))
      .finally(() => setLoading(false));
  }, []);

  const drawChart = (root: OrgNode) => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth || 900;
    const nodeWidth = 180;
    const nodeHeight = 72;
    const horizontalGap = 20;
    const verticalGap = 60;

    d3.select(svgRef.current).selectAll('*').remove();

    const hierarchy = d3.hierarchy(root);
    const treeLayout = d3.tree<OrgNode>().nodeSize([nodeWidth + horizontalGap, nodeHeight + verticalGap]);
    treeLayout(hierarchy);

    const nodes = hierarchy.descendants();
    const links = hierarchy.links();

    const xs = nodes.map((n) => (n as any).x as number);
    const ys = nodes.map((n) => (n as any).y as number);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const svgWidth = Math.max(width, maxX - minX + nodeWidth + 40);
    const svgHeight = maxY - minY + nodeHeight + 80;

    const svg = d3
      .select(svgRef.current)
      .attr('width', svgWidth)
      .attr('height', svgHeight)
      .append('g')
      .attr('transform', `translate(${svgWidth / 2 - (minX + maxX) / 2},${40 - minY})`);

    const linkGen = d3
      .linkVertical<any, any>()
      .x((d: any) => d.x)
      .y((d: any) => d.y);

    svg
      .selectAll('.link')
      .data(links)
      .join('path')
      .attr('class', 'link')
      .attr('d', (d) =>
        linkGen({
          source: { x: (d.source as any).x, y: (d.source as any).y + nodeHeight / 2 },
          target: { x: (d.target as any).x, y: (d.target as any).y - nodeHeight / 2 },
        })
      )
      .attr('fill', 'none')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 1.5);

    const nodeGroup = svg
      .selectAll('.node')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.x},${d.y})`);

    nodeGroup
      .append('rect')
      .attr('x', -nodeWidth / 2)
      .attr('y', -nodeHeight / 2)
      .attr('width', nodeWidth)
      .attr('height', nodeHeight)
      .attr('rx', 8)
      .attr('fill', 'white')
      .attr('stroke', (d) => roleColors[d.data.role] ?? '#94a3b8')
      .attr('stroke-width', 2)
      .attr('filter', 'drop-shadow(0 1px 3px rgba(0,0,0,0.08))');

    nodeGroup
      .append('rect')
      .attr('x', -nodeWidth / 2)
      .attr('y', -nodeHeight / 2)
      .attr('width', 6)
      .attr('height', nodeHeight)
      .attr('rx', 4)
      .attr('fill', (d) => roleColors[d.data.role] ?? '#94a3b8');

    nodeGroup
      .append('text')
      .attr('x', -nodeWidth / 2 + 14)
      .attr('y', -8)
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('fill', '#1e293b')
      .text((d) => d.data.name.length > 18 ? d.data.name.slice(0, 16) + '…' : d.data.name);

    nodeGroup
      .append('text')
      .attr('x', -nodeWidth / 2 + 14)
      .attr('y', 8)
      .attr('font-size', '10px')
      .attr('fill', '#64748b')
      .text((d) => d.data.jobTitle.length > 22 ? d.data.jobTitle.slice(0, 20) + '…' : d.data.jobTitle);

    nodeGroup
      .append('text')
      .attr('x', -nodeWidth / 2 + 14)
      .attr('y', 24)
      .attr('font-size', '10px')
      .attr('fill', '#94a3b8')
      .text((d) => d.data.department);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-16">{error}</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Organization Chart</h1>
        <div className="flex gap-4 mt-2">
          {Object.entries(roleColors).map(([role, color]) => (
            <div key={role} className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: color }}></span>
              {role.replace('_', ' ')}
            </div>
          ))}
        </div>
      </div>
      <div className="card overflow-auto">
        <svg ref={svgRef} className="w-full" style={{ minHeight: 400 }} />
      </div>
    </div>
  );
}
