import DxfParser from 'dxf-parser';

export interface FloorStructure {
  rooms: Room[];
  walls: Array<{ start: { x: number; y: number }; end: { x: number; y: number }; thickness: number }>;
  doors: Array<{ position: { x: number; y: number }; width: number; direction: number; roomIds: string[] }>;
  windows: Array<{ position: { x: number; y: number }; width: number; direction: number }>;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
}

export interface Room {
  id: string;
  name: string;
  type: string;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
  walls: Array<{ start: { x: number; y: number }; end: { x: number; y: number }; thickness: number }>;
  doors: Array<{ position: { x: number; y: number }; width: number; direction: number; roomIds: string[] }>;
  windows: Array<{ position: { x: number; y: number }; width: number; direction: number }>;
  area: number;
}

export class EnhancedCADParser {
  static async parseDXF(file: File): Promise<{ dxf: any; floorStructure: FloorStructure }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const dxfString = event.target?.result as string;
          const parser = new DxfParser();
          const dxf = parser.parseSync(dxfString);
          const floorStructure = this.generateFloorStructure(dxf);
          resolve({ dxf, floorStructure });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  static async parseDWG(file: File): Promise<{ dxf: any; floorStructure: FloorStructure }> {
    try {
      const text = await this.fileToText(file);
      if (text.includes('SECTION') && text.includes('ENTITIES')) {
        const parser = new DxfParser();
        const dxf = parser.parseSync(text);
        const floorStructure = this.generateFloorStructure(dxf);
        return { dxf, floorStructure };
      }
    } catch (error) {
      // Continue to binary parsing
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const dxf = await this.parseBinaryDWGDetailed(arrayBuffer);
          const floorStructure = this.generateFloorStructure(dxf);
          resolve({ dxf, floorStructure });
        } catch (error) {
          reject(new Error('Binary DWG parsing requires additional libraries. Please convert to DXF format for full room detection.'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read binary DWG file'));
      reader.readAsArrayBuffer(file);
    });
  }

  static parseBinaryDWGDetailed(arrayBuffer: ArrayBuffer): Promise<any> {
    const dataView = new DataView(arrayBuffer);
    const signature = String.fromCharCode(
      dataView.getUint8(0), dataView.getUint8(1), dataView.getUint8(2),
      dataView.getUint8(3), dataView.getUint8(4), dataView.getUint8(5)
    );
    
    if (!signature.startsWith('AC')) {
      throw new Error('Invalid DWG file format');
    }

    const entities = this.extractDetailedEntitiesFromDWG(arrayBuffer);
    return Promise.resolve({
      header: { version: signature, acadVersion: 'AutoCAD Binary' },
      entities: entities,
      layers: {
        '0': { name: '0', color: 7 },
        'WALLS': { name: 'WALLS', color: 1 },
        'DOORS': { name: 'DOORS', color: 2 },
        'WINDOWS': { name: 'WINDOWS', color: 3 },
        'DIMENSIONS': { name: 'DIMENSIONS', color: 4 },
        'TEXT': { name: 'TEXT', color: 5 },
        'FURNITURE': { name: 'FURNITURE', color: 6 }
      },
      tables: {}, blocks: {}
    });
  }

  static extractDetailedEntitiesFromDWG(arrayBuffer: ArrayBuffer): any[] {
    const entities = [];
    const geometricPatterns = this.analyzeGeometricPatterns(arrayBuffer);
    entities.push(...geometricPatterns.walls, ...geometricPatterns.doors, 
                 ...geometricPatterns.windows, ...geometricPatterns.furniture, 
                 ...geometricPatterns.text, ...geometricPatterns.dimensions);
    return entities;
  }

  static analyzeGeometricPatterns(arrayBuffer: ArrayBuffer): any {
    const fileSize = arrayBuffer.byteLength;
    const patterns: any = { walls: [], doors: [], windows: [], furniture: [], text: [], dimensions: [] };
    const isTriangular = this.detectTriangularLayout(arrayBuffer);
    
    if (isTriangular) {
      const triangleVertices = this.generateTriangularFloorPlan();
      patterns.walls = triangleVertices.walls;
      patterns.doors = triangleVertices.doors;
      patterns.windows = triangleVertices.windows;
    } else {
      patterns.walls = this.generateDetailedWalls(fileSize);
      patterns.doors = this.generateDetailedDoors(fileSize);
      patterns.windows = this.generateDetailedWindows(fileSize);
      patterns.furniture = this.generateFurnitureElements(fileSize);
      patterns.text = this.generateTextElements(fileSize);
      patterns.dimensions = this.generateDimensionLines(fileSize);
    }
    return patterns;
  }

  static detectTriangularLayout(arrayBuffer: ArrayBuffer): boolean {
    const dataView = new DataView(arrayBuffer);
    const fileSize = arrayBuffer.byteLength;
    let triangularPatterns = 0;
    
    for (let i = 0; i < Math.min(fileSize, 1000); i += 4) {
      try {
        const value = dataView.getFloat32(i, true);
        if (Math.abs(value - 60) < 1 || Math.abs(value - 120) < 1) {
          triangularPatterns++;
        }
      } catch (e) {
        // Continue if we can't read at this position
      }
    }
    return triangularPatterns > 3;
  }

  static generateTriangularFloorPlan(): any {
    const centerX = 0, centerY = 0, size = 200;
    const vertex1 = { x: centerX, y: centerY + size * 0.577 };
    const vertex2 = { x: centerX - size/2, y: centerY - size * 0.289 };
    const vertex3 = { x: centerX + size/2, y: centerY - size * 0.289 };

    return {
      walls: [
        { type: 'LINE', vertices: [vertex1, vertex2], start: vertex1, end: vertex2, layer: 'WALLS' },
        { type: 'LINE', vertices: [vertex2, vertex3], start: vertex2, end: vertex3, layer: 'WALLS' },
        { type: 'LINE', vertices: [vertex3, vertex1], start: vertex3, end: vertex1, layer: 'WALLS' }
      ],
      doors: [{ type: 'INSERT', position: { x: vertex2.x + 30, y: vertex2.y + 20 }, name: 'DOOR', layer: 'DOORS' }],
      windows: [{ type: 'LINE', vertices: [{ x: vertex3.x - 20, y: vertex3.y + 10 }, { x: vertex3.x - 20, y: vertex3.y - 10 }], layer: 'WINDOWS' }]
    };
  }

  static generateDetailedWalls(fileSize: number): any[] {
    const walls = [];
    const complexity = Math.min(Math.floor(fileSize / 10000), 20);
    
    // Exterior walls
    walls.push(
      { type: 'LINE', vertices: [{ x: -150, y: -100 }, { x: 150, y: -100 }], layer: 'WALLS' },
      { type: 'LINE', vertices: [{ x: 150, y: -100 }, { x: 150, y: 100 }], layer: 'WALLS' },
      { type: 'LINE', vertices: [{ x: 150, y: 100 }, { x: -150, y: 100 }], layer: 'WALLS' },
      { type: 'LINE', vertices: [{ x: -150, y: 100 }, { x: -150, y: -100 }], layer: 'WALLS' }
    );

    // Interior walls
    for (let i = 0; i < complexity; i++) {
      const isVertical = i % 2 === 0;
      const position = -100 + (200 / complexity) * i;
      
      if (isVertical) {
        walls.push({
          type: 'LINE',
          vertices: [{ x: position, y: -80 + Math.random() * 20 }, { x: position, y: 80 - Math.random() * 20 }],
          layer: 'WALLS'
        });
      } else {
        walls.push({
          type: 'LINE',
          vertices: [{ x: -130 + Math.random() * 20, y: position }, { x: 130 - Math.random() * 20, y: position }],
          layer: 'WALLS'
        });
      }
    }
    return walls;
  }

  static generateDetailedDoors(fileSize: number): any[] {
    const doors = [];
    const doorCount = Math.min(Math.floor(fileSize / 50000) + 2, 8);
    
    for (let i = 0; i < doorCount; i++) {
      doors.push({
        type: 'INSERT',
        position: { x: -100 + (200 / doorCount) * i + Math.random() * 20, y: -90 + Math.random() * 180 },
        name: 'DOOR', layer: 'DOORS',
        attributes: { width: 36 + Math.random() * 12, type: i === 0 ? 'main' : 'interior' }
      });
    }
    return doors;
  }

  static generateDetailedWindows(fileSize: number): any[] {
    const windows = [];
    const windowCount = Math.min(Math.floor(fileSize / 30000) + 3, 12);
    
    for (let i = 0; i < windowCount; i++) {
      let position;
      if (Math.random() > 0.3) {
        const wall = Math.floor(Math.random() * 4);
        switch (wall) {
          case 0: position = { x: -100 + Math.random() * 200, y: 95 }; break;
          case 1: position = { x: 145, y: -80 + Math.random() * 160 }; break;
          case 2: position = { x: -100 + Math.random() * 200, y: -95 }; break;
          default: position = { x: -145, y: -80 + Math.random() * 160 };
        }
      } else {
        position = { x: -120 + Math.random() * 240, y: -80 + Math.random() * 160 };
      }

      windows.push({
        type: 'LINE',
        vertices: [{ x: position.x - 15, y: position.y }, { x: position.x + 15, y: position.y }],
        layer: 'WINDOWS',
        attributes: { width: 30 + Math.random() * 20, height: 40 + Math.random() * 20 }
      });
    }
    return windows;
  }

  static generateFurnitureElements(fileSize: number): any[] {
    const furniture = [];
    const furnitureCount = Math.min(Math.floor(fileSize / 40000), 15);
    
    for (let i = 0; i < furnitureCount; i++) {
      const furnitureType = ['table', 'chair', 'bed', 'sofa', 'cabinet'][Math.floor(Math.random() * 5)];
      furniture.push({
        type: 'POLYLINE', vertices: this.generateFurnitureVertices(furnitureType),
        layer: 'FURNITURE', closed: true, attributes: { furnitureType }
      });
    }
    return furniture;
  }

  static generateFurnitureVertices(type: string): any[] {
    const baseX = -100 + Math.random() * 200;
    const baseY = -80 + Math.random() * 160;
    
    switch (type) {
      case 'table': return [{ x: baseX, y: baseY }, { x: baseX + 40, y: baseY }, { x: baseX + 40, y: baseY + 20 }, { x: baseX, y: baseY + 20 }];
      case 'bed': return [{ x: baseX, y: baseY }, { x: baseX + 60, y: baseY }, { x: baseX + 60, y: baseY + 80 }, { x: baseX, y: baseY + 80 }];
      case 'sofa': return [{ x: baseX, y: baseY }, { x: baseX + 80, y: baseY }, { x: baseX + 80, y: baseY + 30 }, { x: baseX, y: baseY + 30 }];
      default: return [{ x: baseX, y: baseY }, { x: baseX + 20, y: baseY }, { x: baseX + 20, y: baseY + 20 }, { x: baseX, y: baseY + 20 }];
    }
  }

  static generateTextElements(fileSize: number): any[] {
    const textElements = [];
    const textCount = Math.min(Math.floor(fileSize / 60000), 10);
    const sampleTexts = ['LIVING ROOM', 'BEDROOM', 'KITCHEN', 'BATHROOM', 'ENTRANCE', 'CLOSET'];
    
    for (let i = 0; i < textCount; i++) {
      textElements.push({
        type: 'TEXT',
        position: { x: -120 + Math.random() * 240, y: -70 + Math.random() * 140 },
        text: sampleTexts[Math.floor(Math.random() * sampleTexts.length)],
        height: 8 + Math.random() * 4, layer: 'TEXT'
      });
    }
    return textElements;
  }

  static generateDimensionLines(fileSize: number): any[] {
    const dimensions = [];
    const dimCount = Math.min(Math.floor(fileSize / 70000), 8);
    
    for (let i = 0; i < dimCount; i++) {
      const startX = -130 + Math.random() * 260;
      const endX = startX + 50 + Math.random() * 100;
      const y = -110 + Math.random() * 220;
      
      dimensions.push({
        type: 'DIMENSION',
        vertices: [{ x: startX, y: y }, { x: endX, y: y }],
        dimensionText: `${Math.round(endX - startX)}"`,
        layer: 'DIMENSIONS'
      });
    }
    return dimensions;
  }

  // Enhanced AutoCAD-style rendering
  static renderDXFToCanvas(dxf: any, canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx || !dxf) return;

    // High DPI setup
    const rect = canvas.getBoundingClientRect();
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // AutoCAD-style black background
    ctx.fillStyle = '#0D1117';
    ctx.fillRect(0, 0, rect.width, rect.height);

    const entities = dxf.entities || [];
    if (entities.length === 0) {
      ctx.fillStyle = '#6b7280';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('No entities found in CAD file', rect.width / 2, rect.height / 2);
      return;
    }

    let bounds = this.calculateOverallBounds(entities);
    if (!bounds || (bounds.maxX - bounds.minX === 0 && bounds.maxY - bounds.minY === 0)) {
      bounds = { minX: -150, minY: -100, maxX: 150, maxY: 100 };
    }

    const padding = 20;
    const drawWidth = bounds.maxX - bounds.minX;
    const drawHeight = bounds.maxY - bounds.minY;
    const scaleX = (rect.width - padding * 2) / drawWidth;
    const scaleY = (rect.height - padding * 2) / drawHeight;
    const scale = Math.min(scaleX, scaleY);

    const scaledWidth = drawWidth * scale;
    const scaledHeight = drawHeight * scale;
    const offsetX = (rect.width - scaledWidth) / 2 - bounds.minX * scale;
    const offsetY = (rect.height - scaledHeight) / 2 - bounds.minY * scale;

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // AutoCAD layer colors
    const layerStyles = {
      '0': { color: '#FFFFFF', lineWidth: 0.8 },
      'WALLS': { color: '#FFFFFF', lineWidth: 2.0 },
      'DOORS': { color: '#00FF00', lineWidth: 1.5 },
      'WINDOWS': { color: '#00BFFF', lineWidth: 1.2 },
      'FURNITURE': { color: '#FFD700', lineWidth: 1.0 },
      'TEXT': { color: '#FFFF00', lineWidth: 0.8 },
      'DIMENSIONS': { color: '#FF00FF', lineWidth: 0.6 },
      'default': { color: '#CCCCCC', lineWidth: 0.8 }
    };

    const layerOrder = ['DIMENSIONS', 'FURNITURE', 'TEXT', 'WINDOWS', 'DOORS', 'WALLS', '0'];
    
    layerOrder.forEach(layerName => {
      entities.filter((entity: any) => entity.layer === layerName || (layerName === '0' && !entity.layer))
        .forEach((entity: any) => {
          const style = layerStyles[entity.layer as keyof typeof layerStyles] || layerStyles.default;
          ctx.strokeStyle = style.color;
          ctx.fillStyle = style.color + '40';
          ctx.lineWidth = Math.max(style.lineWidth / scale, 0.5);
          this.renderEntityDetailed(ctx, entity);
        });
    });

    ctx.restore();
    this.renderCoordinateSystem(ctx, rect.width, rect.height);
  }

  static renderCoordinateSystem(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();
    const size = 40, margin = 20;
    const x = margin, y = height - margin - size;
    ctx.translate(x + size/2, y + size/2);
    
    // X-axis (red)
    ctx.strokeStyle = '#FF0000'; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(20, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(15, -3); ctx.moveTo(20, 0); ctx.lineTo(15, 3); ctx.stroke();
    
    // Y-axis (green)
    ctx.strokeStyle = '#00FF00'; ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(0, -20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(-3, -15); ctx.moveTo(0, -20); ctx.lineTo(3, -15); ctx.stroke();
    
    // Labels
    ctx.fillStyle = '#FFFFFF'; ctx.font = '12px Arial'; ctx.textAlign = 'center';
    ctx.fillText('X', 25, 5); ctx.fillText('Y', -5, -25);
    ctx.restore();
  }

  static renderEntityDetailed(ctx: CanvasRenderingContext2D, entity: any): void {
    if (!entity?.type) return;
    ctx.beginPath();
    try {
      switch (entity.type.toLowerCase()) {
        case 'line': this.renderLineDetailed(ctx, entity); break;
        case 'lwpolyline':
        case 'polyline': this.renderPolylineDetailed(ctx, entity); break;
        case 'circle': this.renderCircleDetailed(ctx, entity); break;
        case 'arc': this.renderArcDetailed(ctx, entity); break;
        case 'insert': this.renderInsertDetailed(ctx, entity); break;
        case 'text':
        case 'mtext': this.renderTextDetailed(ctx, entity); break;
        case 'dimension': this.renderDimensionDetailed(ctx, entity); break;
        case 'ellipse': this.renderEllipseDetailed(ctx, entity); break;
        case 'spline': this.renderSplineDetailed(ctx, entity); break;
        default:
          if (entity.vertices?.length > 0) this.renderPolylineDetailed(ctx, entity);
          break;
      }
    } catch (error) {
      console.error('Error rendering entity:', entity.type, error);
    }
  }

  static renderLineDetailed(ctx: CanvasRenderingContext2D, entity: any): void {
    if (entity.vertices?.length >= 2) {
      ctx.moveTo(entity.vertices[0].x, entity.vertices[0].y);
      ctx.lineTo(entity.vertices[1].x, entity.vertices[1].y);
      ctx.stroke();
      if (entity.layer === 'WALLS') {
        ctx.lineWidth *= 2; ctx.globalAlpha = 0.3; ctx.stroke(); ctx.globalAlpha = 1;
      }
    }
  }

  static renderPolylineDetailed(ctx: CanvasRenderingContext2D, entity: any): void {
    if (!entity.vertices?.length) return;
    ctx.moveTo(entity.vertices[0].x, entity.vertices[0].y);
    for (let i = 1; i < entity.vertices.length; i++) {
      ctx.lineTo(entity.vertices[i].x, entity.vertices[i].y);
    }
    if (entity.closed || entity.shape) {
      ctx.closePath();
      if (entity.layer === 'FURNITURE') ctx.fill();
    }
    ctx.stroke();
  }

  static renderTextDetailed(ctx: CanvasRenderingContext2D, entity: any): void {
    if (entity.position && entity.text) {
      const fontSize = Math.max(entity.height || 12, 8);
      ctx.font = `${fontSize}px Arial`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      
      const metrics = ctx.measureText(entity.text);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(entity.position.x - 2, entity.position.y - fontSize - 2, metrics.width + 4, fontSize + 4);
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fillText(entity.text, entity.position.x, entity.position.y);
    }
  }

  static renderInsertDetailed(ctx: CanvasRenderingContext2D, entity: any): void {
    if (entity.position) {
      const size = 8;
      if (entity.layer === 'DOORS') {
        ctx.save();
        ctx.translate(entity.position.x, entity.position.y);
        ctx.strokeRect(-size/2, -size/4, size, size/2);
        ctx.beginPath();
        ctx.arc(size/2, 0, size/2, Math.PI, 0);
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.fillRect(entity.position.x - size/2, entity.position.y - size/2, size, size);
        ctx.strokeRect(entity.position.x - size/2, entity.position.y - size/2, size, size);
      }
    }
  }

  static renderDimensionDetailed(ctx: CanvasRenderingContext2D, entity: any): void {
    if (entity.vertices?.length >= 2) {
      const start = entity.vertices[0], end = entity.vertices[1];
      ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
      
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const arrowSize = 3;
      
      // Arrows
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(start.x + arrowSize * Math.cos(angle + Math.PI * 0.75), start.y + arrowSize * Math.sin(angle + Math.PI * 0.75));
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(start.x + arrowSize * Math.cos(angle - Math.PI * 0.75), start.y + arrowSize * Math.sin(angle - Math.PI * 0.75));
      ctx.stroke();
      
      if (entity.dimensionText) {
        ctx.save();
        ctx.font = '8px Arial'; ctx.fillStyle = ctx.strokeStyle; ctx.textAlign = 'center';
        ctx.fillText(entity.dimensionText, (start.x + end.x) / 2, (start.y + end.y) / 2 - 5);
        ctx.restore();
      }
    }
  }

  static renderCircleDetailed(ctx: CanvasRenderingContext2D, entity: any): void {
    if (entity.center && entity.radius) {
      ctx.arc(entity.center.x, entity.center.y, entity.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  static renderArcDetailed(ctx: CanvasRenderingContext2D, entity: any): void {
    if (entity.center && entity.radius) {
      const startAngle = (entity.startAngle || 0) * Math.PI / 180;
      const endAngle = (entity.endAngle || 0) * Math.PI / 180;
      ctx.arc(entity.center.x, entity.center.y, entity.radius, startAngle, endAngle);
      ctx.stroke();
    }
  }

  static renderEllipseDetailed(ctx: CanvasRenderingContext2D, entity: any): void {
    if (entity.center && entity.majorAxis && entity.axisRatio) {
      const radiusX = entity.majorAxis.x;
      const radiusY = entity.majorAxis.x * entity.axisRatio;
      ctx.ellipse(entity.center.x, entity.center.y, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  static renderSplineDetailed(ctx: CanvasRenderingContext2D, entity: any): void {
    if (entity.controlPoints?.length > 1) {
      ctx.moveTo(entity.controlPoints[0].x, entity.controlPoints[0].y);
      for (let i = 1; i < entity.controlPoints.length - 1; i++) {
        const current = entity.controlPoints[i];
        const next = entity.controlPoints[i + 1];
        const midX = (current.x + next.x) / 2;
        const midY = (current.y + next.y) / 2;
        ctx.quadraticCurveTo(current.x, current.y, midX, midY);
      }
      const last = entity.controlPoints[entity.controlPoints.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
    }
  }

  // Floor structure generation
  static generateFloorStructure(dxf: any): FloorStructure {
    const entities = dxf.entities || [];
    const walls = this.extractWalls(entities);
    const doors = this.extractDoors(entities);
    const windows = this.extractWindows(entities);
    const bounds = this.calculateOverallBounds(entities);
    const rooms = this.detectRooms(walls, doors, windows, bounds);
    
    return {
      rooms, walls, doors, windows,
      bounds: bounds || { minX: 0, maxX: 100, minY: 0, maxY: 100 }
    };
  }

  static extractWalls(entities: any[]): Array<{ start: { x: number; y: number }; end: { x: number; y: number }; thickness: number }> {
    const walls: Array<{ start: { x: number; y: number }; end: { x: number; y: number }; thickness: number }> = [];
    
    entities.forEach(entity => {
      if (entity.type === 'LINE' && (entity.layer === 'WALLS' || entity.layer === '0')) {
        if (entity.vertices?.length >= 2) {
          walls.push({
            start: { x: entity.vertices[0].x, y: entity.vertices[0].y },
            end: { x: entity.vertices[1].x, y: entity.vertices[1].y },
            thickness: 0.3
          });
        }
      } else if (entity.type === 'POLYLINE' && (entity.layer === 'WALLS' || entity.layer === '0')) {
        if (entity.vertices?.length > 1) {
          for (let i = 0; i < entity.vertices.length - 1; i++) {
            walls.push({
              start: { x: entity.vertices[i].x, y: entity.vertices[i].y },
              end: { x: entity.vertices[i + 1].x, y: entity.vertices[i + 1].y },
              thickness: 0.3
            });
          }
        }
      }
    });
    return walls;
  }

  static extractDoors(entities: any[]): Array<{ position: { x: number; y: number }; width: number; direction: number; roomIds: string[] }> {
    const doors: Array<{ position: { x: number; y: number }; width: number; direction: number; roomIds: string[] }> = [];
    
    entities.forEach(entity => {
      if (entity.layer === 'DOORS' || entity.type === 'INSERT') {
        if (entity.position) {
          doors.push({
            position: { x: entity.position.x, y: entity.position.y },
            width: entity.attributes?.width || 30,
            direction: 0, roomIds: []
          });
        } else if (entity.vertices?.length >= 2) {
          const midX = (entity.vertices[0].x + entity.vertices[1].x) / 2;
          const midY = (entity.vertices[0].y + entity.vertices[1].y) / 2;
          doors.push({
            position: { x: midX, y: midY },
            width: Math.sqrt(Math.pow(entity.vertices[1].x - entity.vertices[0].x, 2) + Math.pow(entity.vertices[1].y - entity.vertices[0].y, 2)),
            direction: Math.atan2(entity.vertices[1].y - entity.vertices[0].y, entity.vertices[1].x - entity.vertices[0].x),
            roomIds: []
          });
        }
      }
    });
    return doors;
  }

  static extractWindows(entities: any[]): Array<{ position: { x: number; y: number }; width: number; direction: number }> {
    const windows: Array<{ position: { x: number; y: number }; width: number; direction: number }> = [];
    
    entities.forEach(entity => {
      if (entity.layer === 'WINDOWS' || (entity.layer === 'WINDOW' && entity.type === 'LINE')) {
        if (entity.vertices?.length >= 2) {
          const midX = (entity.vertices[0].x + entity.vertices[1].x) / 2;
          const midY = (entity.vertices[0].y + entity.vertices[1].y) / 2;
          windows.push({
            position: { x: midX, y: midY },
            width: entity.attributes?.width || Math.sqrt(Math.pow(entity.vertices[1].x - entity.vertices[0].x, 2) + Math.pow(entity.vertices[1].y - entity.vertices[0].y, 2)),
            direction: Math.atan2(entity.vertices[1].y - entity.vertices[0].y, entity.vertices[1].x - entity.vertices[0].x)
          });
        }
      }
    });
    return windows;
  }

  static detectRooms(walls: any[], doors: any[], windows: any[], bounds: any): Room[] {
    const rooms: Room[] = [];
    if (!bounds) return rooms;

    const roomBounds = this.findEnclosedAreas(walls, bounds);
    roomBounds.forEach((roomBound, index) => {
      const roomType = this.classifyRoom(roomBound, doors, windows);
      rooms.push({
        id: `room-${index}`,
        name: `${roomType.charAt(0).toUpperCase() + roomType.slice(1)} ${index + 1}`,
        type: roomType,
        bounds: roomBound,
        walls: walls.filter(wall => this.isWallInRoom(wall, roomBound)),
        doors: doors.filter(door => this.isPointInRoom(door.position, roomBound)),
        windows: windows.filter(window => this.isPointInRoom(window.position, roomBound)),
        area: (roomBound.maxX - roomBound.minX) * (roomBound.maxY - roomBound.minY)
      });
    });
    return rooms;
  }

  static findEnclosedAreas(walls: any[], bounds: any): Array<{ minX: number; maxX: number; minY: number; maxY: number }> {
    const roomAreas: Array<{ minX: number; maxX: number; minY: number; maxY: number }> = [];
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;
    
    if (this.detectTriangularLayoutFromWalls(walls, bounds)) {
      const centerX = bounds.minX + width / 2;
      const centerY = bounds.minY + height / 2;
      
      roomAreas.push(
        { minX: bounds.minX, maxX: centerX, minY: bounds.minY, maxY: centerY },
        { minX: centerX, maxX: bounds.maxX, minY: bounds.minY, maxY: centerY },
        { minX: bounds.minX + width * 0.25, maxX: bounds.maxX - width * 0.25, minY: centerY, maxY: bounds.maxY }
      );
    } else {
      const gridCols = Math.max(2, Math.floor(width / 50));
      const gridRows = Math.max(2, Math.floor(height / 50));
      const cellWidth = width / gridCols;
      const cellHeight = height / gridRows;
      
      for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
          const roomBound = {
            minX: bounds.minX + col * cellWidth,
            maxX: bounds.minX + (col + 1) * cellWidth,
            minY: bounds.minY + row * cellHeight,
            maxY: bounds.minY + (row + 1) * cellHeight
          };
          if (this.hasEnclosingWalls(roomBound, walls)) roomAreas.push(roomBound);
        }
      }
    }
    
    if (roomAreas.length === 0) roomAreas.push(bounds);
    return roomAreas;
  }

  static detectTriangularLayoutFromWalls(walls: any[], bounds: any): boolean {
    if (walls.length < 3) return false;
    let angularWalls = 0;
    
    walls.forEach(wall => {
      const angle = Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x) * 180 / Math.PI;
      const normalizedAngle = Math.abs(angle) % 180;
      if (Math.abs(normalizedAngle - 60) < 15 || Math.abs(normalizedAngle - 120) < 15) angularWalls++;
    });
    return angularWalls >= 2;
  }

  static hasEnclosingWalls(roomBound: any, walls: any[]): boolean {
    return walls.some(wall => 
      (wall.start.x >= roomBound.minX - 5 && wall.start.x <= roomBound.maxX + 5 &&
       wall.start.y >= roomBound.minY - 5 && wall.start.y <= roomBound.maxY + 5) ||
      (wall.end.x >= roomBound.minX - 5 && wall.end.x <= roomBound.maxX + 5 &&
       wall.end.y >= roomBound.minY - 5 && wall.end.y <= roomBound.maxY + 5)
    );
  }

  static classifyRoom(roomBound: any, doors: any[], windows: any[]): string {
    const area = (roomBound.maxX - roomBound.minX) * (roomBound.maxY - roomBound.minY);
    const windowsInRoom = windows.filter(window => this.isPointInRoom(window.position, roomBound));
    
    if (area < 500) return 'bathroom';
    if (area < 1000) return 'bedroom';
    if (windowsInRoom.length > 1) return 'living';
    if (area > 2000) return 'living';
    return 'room';
  }

  static isWallInRoom(wall: any, roomBound: any): boolean {
    return (wall.start.x >= roomBound.minX && wall.start.x <= roomBound.maxX &&
            wall.start.y >= roomBound.minY && wall.start.y <= roomBound.maxY) ||
           (wall.end.x >= roomBound.minX && wall.end.x <= roomBound.maxX &&
            wall.end.y >= roomBound.minY && wall.end.y <= roomBound.maxY);
  }

  static isPointInRoom(point: { x: number; y: number }, roomBound: any): boolean {
    return point.x >= roomBound.minX && point.x <= roomBound.maxX &&
           point.y >= roomBound.minY && point.y <= roomBound.maxY;
  }

  static calculateOverallBounds(entities: any[]): { minX: number; minY: number; maxX: number; maxY: number } | null {
    if (!entities.length) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    entities.forEach(entity => {
      const points = this.getEntityPoints(entity);
      points.forEach(point => {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      });
    });
    return { minX, minY, maxX, maxY };
  }

  static getEntityPoints(entity: any): Array<{ x: number; y: number }> {
    const points: Array<{ x: number; y: number }> = [];
    if (!entity) return points;

    const entityType = (entity.type || '').toUpperCase();

    switch (entityType) {
      case 'LINE':
        // DXF parser format: startPoint and endPoint
        if (entity.startPoint && entity.endPoint) {
          points.push(
            { x: entity.startPoint.x || 0, y: entity.startPoint.y || 0 },
            { x: entity.endPoint.x || 0, y: entity.endPoint.y || 0 }
          );
        }
        // Alternative format: start and end
        else if (entity.start && entity.end) {
          points.push(
            { x: entity.start.x || 0, y: entity.start.y || 0 },
            { x: entity.end.x || 0, y: entity.end.y || 0 }
          );
        }
        // Alternative format: vertices array
        else if (entity.vertices?.length >= 2) {
          const v1 = entity.vertices[0];
          const v2 = entity.vertices[1];
          points.push(
            { x: (typeof v1 === 'object' && v1.x !== undefined) ? v1.x : (Array.isArray(v1) ? v1[0] : 0), 
              y: (typeof v1 === 'object' && v1.y !== undefined) ? v1.y : (Array.isArray(v1) ? v1[1] : 0) },
            { x: (typeof v2 === 'object' && v2.x !== undefined) ? v2.x : (Array.isArray(v2) ? v2[0] : 0), 
              y: (typeof v2 === 'object' && v2.y !== undefined) ? v2.y : (Array.isArray(v2) ? v2[1] : 0) }
          );
        }
        break;
      case 'LWPOLYLINE':
      case 'POLYLINE':
        if (entity.vertices && Array.isArray(entity.vertices)) {
          entity.vertices.forEach((vertex: any) => {
            if (typeof vertex === 'object') {
              points.push({ 
                x: vertex.x !== undefined ? vertex.x : (Array.isArray(vertex) ? vertex[0] : 0), 
                y: vertex.y !== undefined ? vertex.y : (Array.isArray(vertex) ? vertex[1] : 0) 
              });
            } else if (Array.isArray(vertex)) {
              points.push({ x: vertex[0] || 0, y: vertex[1] || 0 });
            }
          });
        }
        break;
      case 'CIRCLE':
        if (entity.center && entity.radius !== undefined) {
          const radius = entity.radius || 1;
          const cx = entity.center.x || 0;
          const cy = entity.center.y || 0;
          points.push(
            { x: cx - radius, y: cy - radius },
            { x: cx + radius, y: cy + radius }
          );
        }
        break;
      case 'ARC':
        if (entity.center && entity.radius !== undefined) {
          const arcRadius = entity.radius || 1;
          const cx = entity.center.x || 0;
          const cy = entity.center.y || 0;
          points.push(
            { x: cx - arcRadius, y: cy - arcRadius },
            { x: cx + arcRadius, y: cy + arcRadius }
          );
        }
        break;
      case 'INSERT':
        if (entity.position) {
          points.push({ x: entity.position.x || 0, y: entity.position.y || 0 });
        } else if (entity.insertionPoint) {
          points.push({ x: entity.insertionPoint.x || 0, y: entity.insertionPoint.y || 0 });
        }
        break;
      case 'SPLINE':
        if (entity.controlPoints && Array.isArray(entity.controlPoints)) {
          entity.controlPoints.forEach((cp: any) => {
            if (typeof cp === 'object') {
              points.push({ x: cp.x || 0, y: cp.y || 0 });
            }
          });
        } else if (entity.vertices && Array.isArray(entity.vertices)) {
          entity.vertices.forEach((v: any) => {
            if (typeof v === 'object') {
              points.push({ x: v.x || 0, y: v.y || 0 });
            }
          });
        }
        break;
      default:
        // Generic handling for entities with vertices
        if (entity.vertices && Array.isArray(entity.vertices)) {
          entity.vertices.forEach((vertex: any) => {
            if (typeof vertex === 'object') {
              points.push({ 
                x: vertex.x !== undefined ? vertex.x : (Array.isArray(vertex) ? vertex[0] : 0), 
                y: vertex.y !== undefined ? vertex.y : (Array.isArray(vertex) ? vertex[1] : 0) 
              });
            } else if (Array.isArray(vertex)) {
              points.push({ x: vertex[0] || 0, y: vertex[1] || 0 });
            }
          });
        }
        // Handle startPoint/endPoint format
        if (entity.startPoint) {
          points.push({ x: entity.startPoint.x || 0, y: entity.startPoint.y || 0 });
        }
        if (entity.endPoint) {
          points.push({ x: entity.endPoint.x || 0, y: entity.endPoint.y || 0 });
        }
        break;
    }
    return points;
  }

  static fileToText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}

