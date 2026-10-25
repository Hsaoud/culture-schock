import json, math

def simplify(points, tolerance=0.20):
    if len(points) <= 4: return points
    a,b = points[0],points[-1]
    dx,dy=b[0]-a[0],b[1]-a[1]
    def distance(p):
        t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy))) if dx*dx+dy*dy else 0
        return math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)
    d,i=max((distance(p),i) for i,p in enumerate(points[1:-1],1))
    if d>tolerance: return simplify(points[:i+1],tolerance)[:-1]+simplify(points[i:],tolerance)
    return [a,b]

source=json.load(open('assets/world-source.geojson',encoding='utf-8'))
countries=[]
for f in source['features']:
    p=f['properties']; code=p['ISO3166-1-Alpha-2']
    if len(code)!=2 or code=='AQ': continue
    polys=f['geometry']['coordinates'] if f['geometry']['type']=='MultiPolygon' else [f['geometry']['coordinates']]
    paths=[]; biggest=max(polys,key=lambda poly: abs(sum(poly[0][i][0]*poly[0][i+1][1]-poly[0][i+1][0]*poly[0][i][1] for i in range(len(poly[0])-1))))[0]
    cx=sum(p[0] for p in biggest)/len(biggest); cy=sum(p[1] for p in biggest)/len(biggest)
    for poly in polys:
        ring=simplify(poly[0]); points=[(round((x+180)*3,1),round((84-y)*3.6,1)) for x,y,*_ in ring]
        if len(points)<4: continue
        paths.append('M'+'L'.join(f'{x},{y}' for x,y in points)+'Z')
    countries.append({'id':code,'name':p['name'],'x':round((cx+180)*3,1),'y':round((84-cy)*3.6,1),'lon':round(cx,2),'lat':round(cy,2),'path':''.join(paths)})
json.dump(countries,open('assets/world.json','w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print(f'{len(countries)} pays et territoires préparés.')
