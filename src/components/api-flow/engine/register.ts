//@ts-nocheck
import { Point, Path } from '@antv/x6-geometry';
import { smooth } from '@antv/x6/lib/registry/connector/smooth';
import { rounded } from '@antv/x6/lib/registry/connector/rounded';
import { configStore } from './store';

export const smoothRoundedRouter = function (vertices, options, edgeView) {
    const sPoint = edgeView.sourceBBox.center
    const tPoint = edgeView.targetBBox.center
    const offsetX = 14
    const offsetY = 14
    let verticesAdd = []
    if (sPoint.x > tPoint.x) {
        if (sPoint.y < tPoint.y) {
            verticesAdd.push({ x: sPoint.x + offsetX, y: sPoint.y + offsetY }, { x: tPoint.x - offsetX, y: tPoint.y - offsetY })
        } else {
            verticesAdd.push({ x: sPoint.x + offsetX, y: sPoint.y - offsetY }, { x: tPoint.x - offsetX, y: tPoint.y + offsetY })
        }
    }
    return [...verticesAdd];
};

export const smoothCenterRouter = function (vertices, options, edgeView) {
    const sPoint = edgeView.sourceBBox.center
    const tPoint = edgeView.targetBBox.center
    const offsetX = 10
    const offsetY = 14
    let verticesAdd = []
    if (sPoint.x > tPoint.x) {
        if (sPoint.y < tPoint.y) {
            verticesAdd.push({ x: sPoint.x + offsetX, y: sPoint.y + offsetY }, { x: tPoint.x - offsetX, y: tPoint.y - offsetY })
        } else {
            verticesAdd.push({ x: sPoint.x + offsetX, y: sPoint.y - offsetY }, { x: tPoint.x - offsetX, y: tPoint.y + offsetY })
        }
    }
    return [...verticesAdd];
};

function makeCenterPoints(sourceCorner, targetCorner) {
    return [{
        x: (sourceCorner.x + targetCorner.x) / 2,
        y: sourceCorner.y
    }, {
        x: (sourceCorner.x + targetCorner.x) / 2,
        y: (sourceCorner.y + targetCorner.y) / 2
    }, { x: (sourceCorner.x + targetCorner.x) / 2, y: targetCorner.y }]
}

export const smoothRounded = function (sourcePoint, targetPoint, routePoints, options = {}) {
    if (routePoints.length == 0) {
        return smooth(sourcePoint, targetPoint, routePoints, options)
    }
    const path = new Path();
    path.appendSegment(Path.createSegment('M', sourcePoint));
    const f13 = 1 / 3;
    const f23 = 2 / 3;
    const radius = options.radius || 10;
    let prevDistance;
    let nextDistance;
    for (let i = 0, ii = routePoints.length; i < ii; i += 1) {
        const curr = Point.create(routePoints[i]);
        const prev = routePoints[i - 1] || sourcePoint;
        const next = routePoints[i + 1] || targetPoint;
        prevDistance = nextDistance || curr.distance(prev) / 2;
        nextDistance = curr.distance(next) / 2;
        const startMove = -Math.min(radius, prevDistance);
        const endMove = -Math.min(radius, nextDistance);
        const roundedStart = curr.clone().move(prev, startMove).round();
        const roundedEnd = curr.clone().move(next, endMove).round();
        const control1 = new Point(f13 * roundedStart.x + f23 * curr.x, f23 * curr.y + f13 * roundedStart.y);
        const control2 = new Point(f13 * roundedEnd.x + f23 * curr.x, f23 * curr.y + f13 * roundedEnd.y);
        path.appendSegment(Path.createSegment('L', roundedStart));
        path.appendSegment(Path.createSegment('C', control1, control2, roundedEnd));
    }
    path.appendSegment(Path.createSegment('L', targetPoint));
    return options.raw ? path : path.serialize();
};


export const smoothCenter = function (sourcePoint, targetPoint, routePoints, options = {}) {
    if (routePoints.length == 0) {
        return rounded(sourcePoint, targetPoint, makeCenterPoints(sourcePoint, targetPoint), options)
    }
    let routePointsUse = [[routePoints[0].x, sourcePoint.y], routePoints[0], ...makeCenterPoints(routePoints[0], routePoints[1]), routePoints[1], [routePoints[1].x, targetPoint.y]]
    const path = new Path();
    path.appendSegment(Path.createSegment('M', sourcePoint));
    const f13 = 1 / 3;
    const f23 = 2 / 3;
    const radius = options.radius || 10;
    let prevDistance;
    let nextDistance;
    for (let i = 0, ii = routePointsUse.length; i < ii; i += 1) {
        const curr = Point.create(routePointsUse[i]);
        const prev = routePointsUse[i - 1] || sourcePoint;
        const next = routePointsUse[i + 1] || targetPoint;
        prevDistance = nextDistance || curr.distance(prev) / 2;
        nextDistance = curr.distance(next) / 2;
        // let radiusUse = (i == 0 || i == ii - 1) ? circleRadius : radius
        const startMove = -Math.min(radius, prevDistance);
        const endMove = -Math.min(radius, nextDistance);
        const roundedStart = curr.clone().move(prev, startMove).round();
        const roundedEnd = curr.clone().move(next, endMove).round();
        const control1 = new Point(f13 * roundedStart.x + f23 * curr.x, f23 * curr.y + f13 * roundedStart.y);
        const control2 = new Point(f13 * roundedEnd.x + f23 * curr.x, f23 * curr.y + f13 * roundedEnd.y);
        path.appendSegment(Path.createSegment('L', roundedStart));
        path.appendSegment(Path.createSegment('C', control1, control2, roundedEnd));
    }
    path.appendSegment(Path.createSegment('L', targetPoint));
    return options.raw ? path : path.serialize();
};