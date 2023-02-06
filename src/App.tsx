import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Stack,
  StackDivider,
  Text,
  FormControl,
  FormLabel,
  Select,
  Button,
  Container,
  VStack,
  Input,
} from "@chakra-ui/react";
import React, { useState, useMemo } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useMount } from "react-use";
export interface BusinessObject {
  lineShowCode: string;
  lineId: number;
  lineName: string;
  orderNum: string;
  lineColor: string;
  stations: Stations[];
  lineNameEn: string;
}

export interface Stations {
  isHuanCheng: boolean;
  stationNameEn: string;
  orderNum: number;
  stationName: string;
  hcLines: HcLines[];
  stationShowCode: string;
  stationId: number;
}

export interface HcLines {
  lineShowCode: string;
  lineId: number;
  lineName: string;
  lineColor: string;
  lineNameEn: string;
}
type Inputs = {
  start: string;
  end: string;
  numberOfDays: number;
  startStation: string;
  endStation: string;
};
export default function App() {
  const [businessObject, setBusinessObject] = useState<BusinessObject[]>([]);
  const initData = async () => {
    const res = await fetch(
      `https://apis.gzmtr.com/app-map/metroweb/linestation`,
      {
        method: "POST",
      }
    );
    const data = await res.json();
    console.log("线路数据", data);
    setBusinessObject(data.businessObject);
  };
  useMount(() => initData());
  const [price, setPrice] = useState(0);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    console.log(data);
    const res = await fetch(
      `https://apis.gzmtr.com/app-map/metroweb/route/${data.startStation}/${data.endStation}`,
      {
        method: "POST",
      }
    );
    const data1 = await res.json();
    console.log("data1", data1.businessObject.price);
    setPrice(data1.businessObject.price);
  };
  const watchFields = watch([
    "start",
    "end",
    "numberOfDays",
    "startStation",
    "endStation",
  ]);

  const totalCoast = useMemo(() => {
    return price * 16 + price * (watchFields[2] * 2 - 16) * 0.6;
  }, [price, watchFields]);

  React.useEffect(() => {
    const subscription = watch((value, { name, type }) =>
      console.log(value, name, type)
    );
    return () => subscription.unsubscribe();
  }, [watch]);
  return (
    <VStack>
      <Container maxW="550px">
        <Card>
          <CardHeader>
            <Heading size="md">漂流小屋</Heading>
          </CardHeader>
          <CardBody>
            <Stack divider={<StackDivider />} spacing="4">
              <Box>
                <Heading size="xs" textTransform="uppercase">
                  通勤费用计算
                </Heading>
                <Text pt="2" fontSize="sm">
                  根据起始地铁站结合上班天数，计算通勤花费
                </Text>
              </Box>
              <Box>
                <Text pt="2" fontSize="sm" as={"div"}>
                  <div>
                    {watchFields[3]}
                    {"=>"} {watchFields[4]} 总花费{totalCoast}
                  </div>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <FormControl>
                      <FormLabel>上班天数</FormLabel>
                      <Input
                        type="number"
                        {...register("numberOfDays", { required: true })}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>选择出发地铁站</FormLabel>
                      <Select
                        placeholder="选择出发地铁站"
                        {...register("start", { required: true })}
                      >
                        {businessObject?.map((item) => (
                          <option key={item.lineId} value={item.lineName}>
                            {item.lineName}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <Box
                      display={"flex"}
                      w={450}
                      h={100}
                      overflow={"auto"}
                      flexWrap={"wrap"}
                    >
                      {businessObject
                        ?.find((item) => item.lineName === watchFields[0])
                        ?.stations.map((station) => (
                          <Button
                            colorScheme="blue"
                            key={station.stationId}
                            m={2}
                            onClick={() =>
                              setValue("startStation", station.stationName)
                            }
                          >
                            {station.stationName}
                          </Button>
                        ))}
                    </Box>
                    <FormControl>
                      <FormLabel>选择目标地铁站</FormLabel>
                      <Select
                        placeholder="选择目标地铁站"
                        {...register("end", { required: true })}
                      >
                        {businessObject?.map((item) => (
                          <option key={item.lineId} value={item.lineName}>
                            {item.lineName}
                          </option>
                        ))}
                      </Select>
                      <Box
                        display={"flex"}
                        w={450}
                        h={100}
                        overflow={"auto"}
                        flexWrap={"wrap"}
                      >
                        {businessObject
                          ?.find((item) => item.lineName === watchFields[1])
                          ?.stations.map((station) => (
                            <Button
                              colorScheme="blue"
                              key={station.stationId}
                              m={2}
                              onClick={() =>
                                setValue("endStation", station.stationName)
                              }
                            >
                              {station.stationName}
                            </Button>
                          ))}
                      </Box>
                    </FormControl>

                    <Button type="submit">计算通勤花费</Button>
                  </form>
                </Text>
              </Box>
            </Stack>
          </CardBody>
        </Card>
      </Container>
    </VStack>
  );
}
