protoc \
    -I ../casemod/types \
    --plugin=./node_modules/.bin/protoc-gen-ts_proto \
    --ts_proto_opt=forceLong=bigint \
    --ts_proto_opt=esModuleInterop=true \
    --ts_proto_opt=useOptionals=message \
    --ts_proto_out=./src/models types.proto