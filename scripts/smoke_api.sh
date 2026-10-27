#!/usr/bin/env bash
# Backend API tezkor tekshiruvi (server http://localhost:8000 da ishlab turishi kerak)
B=http://localhost:8000
J='Content-Type: application/json'
TOKEN=$(curl -s -X POST $B/api/auth/login -H "$J" -d '{"email":"admin","password":"admin123"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")
echo token:${TOKEN:0:15}
curl -s "$B/api/courses?q=python" | head -c 160; echo
curl -s $B/api/courses/python-dasturlash-asoslari | head -c 120; echo
curl -s -X POST $B/api/courses -H "Authorization: Bearer $TOKEN" -H "$J" -d '{"title":"Test kurs","category":"Dizayn"}' | head -c 120; echo
curl -s -X POST $B/api/courses -H "$J" -d '{"title":"x"}'; echo
curl -s -X POST $B/api/events/1/register -H "$J" -d '{"full_name":"Test User","email":"t@x.uz"}'; echo
curl -s -X POST $B/api/events/1/register -H "$J" -d '{"full_name":"Test User","email":"t@x.uz"}'; echo
curl -s -X POST $B/api/contact -H "$J" -d '{"name":"Ali","email":"a@b.uz","message":"Salom dunyo"}'; echo
curl -s -X POST $B/api/track -H "$J" -d '{"path":"/"}' -w "%{http_code}\n"
curl -s "$B/api/admin/analytics?days=3" -H "Authorization: Bearer $TOKEN" | head -c 260; echo
curl -s "$B/api/search?q=python" | head -c 160; echo
curl -s -X POST $B/api/chat -H "$J" -d '{"messages":[{"role":"user","content":"Salom"}]}'; echo
curl -s -X POST $B/api/auth/register -H "$J" -d '{"email":"u@x.uz","full_name":"Ali Vali","password":"secret12"}' | head -c 100; echo
curl -s "$B/api/admin/users" -H "Authorization: Bearer $TOKEN" | head -c 120; echo
curl -s -X PUT "$B/api/events/1" -H "Authorization: Bearer $TOKEN" -H "$J" -d '{"starts_at":"2027-01-05T10:00","capacity":"50"}' | head -c 200; echo
