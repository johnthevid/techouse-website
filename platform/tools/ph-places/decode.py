"""Decode all-the-cities' cities.pbf (protobuf messages, delta-coded coordinates) to JSON for PH."""
import json, sys
data = open(sys.argv[1], 'rb').read()
pos = 0
def varint():
    global pos
    shift = result = 0
    while True:
        b = data[pos]; pos += 1
        result |= (b & 0x7f) << shift
        if b < 0x80: return result
        shift += 7
def svarint():
    v = varint(); return (v >> 1) ^ -(v & 1)
names = {2: 'name', 3: 'country', 4: 'altName', 5: 'muni', 6: 'muniSub', 7: 'featureCode', 8: 'adminCode'}
lon = lat = 0
out = []
while pos < len(data):
    end = varint() + pos
    c = {}
    while pos < end:
        key = varint(); tag, typ = key >> 3, key & 7
        if tag == 1: c['id'] = svarint()
        elif tag in names:
            n = varint(); c[names[tag]] = data[pos:pos + n].decode('utf-8'); pos += n
        elif tag == 9: c['population'] = varint()
        elif tag == 10: lon += svarint(); c['lon'] = lon / 1e5
        elif tag == 11: lat += svarint(); c['lat'] = lat / 1e5
        else: raise SystemExit(f'unknown tag {tag} type {typ}')
    if c.get('country') == 'PH': out.append(c)
json.dump(out, open(sys.argv[2], 'w'), ensure_ascii=False)
print(len(out))
