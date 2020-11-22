echo '\n\n requesting all heroes'
curl localhost:3333/heroes

echo '\n\n requesting flash'
curl localhost:3333/heroes/1

echo '\n\n requesting white wrong body'
curl --silent -X POST \
  --data-binary '{"invalid": "data"}' \
  localhost:3333/heroes

echo '\n\n Creating chapolin'
CREATE=$(curl --silent -X POST \
  --data-binary '{"name": "Chapolin", "age": 100, "power": "Stren"}' \
  localhost:3333/heroes)

echo $CREATE

ID=$(echo $CREATE | jq .id)
echo $ID

echo "\n\n requesting chapolin..."
curl localhost:3333/heroes/$ID