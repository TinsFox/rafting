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
  List,
  ListItem,
  ListIcon,
  OrderedList,
  UnorderedList,
  Input,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
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
  const { isOpen, onOpen, onClose } = useDisclosure();
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
  const [timeCoast, setTimeCoast] = useState(0);
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (data.numberOfDays <= 0) {
      alert("不要捣乱，居家办公或者去找工作去");
      return;
    }
    console.log(data);
    const res = await fetch(
      `https://apis.gzmtr.com/app-map/metroweb/route/${data.startStation}/${data.endStation}`,
      {
        method: "POST",
      }
    );
    const data1 = await res.json();
    console.log("时间", data1.businessObject.routes[0].metro[0].spend_time);

    console.log(
      "data1",
      data1.businessObject.routes[0].metro[0].spend_time / 60
    );
    setTimeCoast(data1.businessObject.routes[0].metro[0].spend_time / 60);
    setPrice(data1.businessObject.price);
    onOpen();
  };
  const watchFields = watch([
    "start", //0
    "end", //1
    "numberOfDays", //2
    "startStation", //3
    "endStation", //4
  ]);
  // 单价*15 + （天数 * 2 - 15）* 单价 * 0.6
  const totalCoast = useMemo(() => {
    const total = watchFields[2] * 2;
    if (total > 15) {
      return price * 15 + price * (total - 15) * 0.6;
    } else {
      return price * total;
    }
  }, [price, watchFields]);

  React.useEffect(() => {
    const subscription = watch((value, { name, type }) =>
      console.log(value, name, type)
    );
    return () => subscription.unsubscribe();
  }, [watch]);
  return (
    <>
      <VStack width="100vw" mt={10}>
        <Card minW="330">
          <CardHeader>
            <Heading size="md">打工账本</Heading>
          </CardHeader>
          <CardBody>
            <Box>
              <Heading size="xs" textTransform="uppercase">
                通勤费用计算
              </Heading>
              <Accordion allowMultiple>
                <AccordionItem>
                  <AccordionButton>
                    <Box as="span" flex="1" textAlign="left">
                      使用方法
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    <OrderedList>
                      <ListItem>输入上班天数</ListItem>
                      <ListItem>选择地铁起始站点</ListItem>
                      <ListItem>开始计算</ListItem>
                    </OrderedList>
                  </AccordionPanel>
                </AccordionItem>
                <AccordionItem>
                  <AccordionButton>
                    <Box as="span" flex="1" textAlign="left">
                      计算规则
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    <OrderedList>
                      <ListItem>通勤次数=上班天数*2</ListItem>
                      <ListItem>前15次原价计算</ListItem>
                      <ListItem>第16次后打六折</ListItem>
                    </OrderedList>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </Box>
            <Box>
              <Text pt="2" fontSize="sm" as={"div"}>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <FormControl>
                    <FormLabel>上班天数</FormLabel>
                    <Input
                      type="number"
                      {...register("numberOfDays", { required: true })}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>选择出发地铁站：{watchFields[3]}</FormLabel>
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
                  {watchFields[0] && (
                    <Box
                      display={"flex"}
                      overflow={"auto"}
                      flexWrap={"wrap"}
                      h={100}
                      mt="5"
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
                  )}

                  <FormControl>
                    <FormLabel>选择目标地铁站：{watchFields[4]}</FormLabel>
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
                    {watchFields[1] && (
                      <Box
                        display={"flex"}
                        maxW="100vw"
                        h={100}
                        overflow={"auto"}
                        flexWrap={"wrap"}
                        mt="5"
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
                    )}
                  </FormControl>
                  <Button type="submit" m={"0 auto"} display="block" mt="15">
                    计算通勤花费
                  </Button>
                </form>
              </Text>
            </Box>
          </CardBody>
        </Card>
      </VStack>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>通勤花费</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box display={"flex"} justifyContent="center" mb="10">
              <Box>
                <Text mr="5">出发站：{watchFields[3]}</Text>
                <Text>目的地：{watchFields[4]}</Text>
              </Box>
              <Box>
                <Text mr="5">单程花费：{price}元</Text>
                <Text>总花费：{totalCoast}元</Text>
              </Box>
            </Box>
            <Box display={"flex"} justifyContent="center" mb="10">
              <Text mr="5">单程耗时：{timeCoast}分钟</Text>
              <Text>每天耗时：{timeCoast * 2}分钟</Text>
            </Box>
            <Box display={"flex"} justifyContent="center" mb="10">
              <Text>
                一个月你要在地铁上：{timeCoast * watchFields[2] * 2}分钟
              </Text>
            </Box>
            <Box textAlign={"center"}>
              计算公式：
              <span>
                {watchFields[2] * 2 > 15 ? (
                  <span>
                    {price} * 15 + {price} * ({watchFields[2]} * 2 - 15) * 0.6
                  </span>
                ) : (
                  <span>
                    {price} * ({watchFields[2]} * 2 )
                  </span>
                )}
              </span>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
