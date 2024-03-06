import {ActionIcon, Box, Button, Container, Group, Indicator, Menu, Tabs} from '@mantine/core';
import {IconBell,} from '@tabler/icons-react';
import {MantineLogo} from '@mantinex/mantine-logo';
import classes from './Global.module.css';
import {useDisclosure} from '@mantine/hooks';
import React, {useEffect, useState} from "react";
import {parseCookies} from 'nookies'
import {pb} from "../lib/pb";
import TabsPanel from "../components/TabsPanel";
import {useRouter} from "next/router";

// get token
export async function getServerSideProps(context: any) {
    const {pb_auth: token} = parseCookies(context);

    return {
        props: {
            token: token || null
        }
    };
}


interface Props {
    token: string | null;


}

const HeaderTabs: React.FC<Props> = ({token}) => {
    const [opened, {toggle}] = useDisclosure(true);
    const [activeTab, setActiveTab] = useState<string | null>('inbox');
    const [messages, setMessages] = useState<any>([])
    const [notifications, setNotifications] = useState<any>([])

    const router = useRouter();

    // check token
   useEffect(() => {
         if (!token) {
              router.push("/login")
         }
   }, [])

    // get all notifications
    useEffect(() => {
        const getNotifications = async () => {
            try {
                const datas = await fetch("http://localhost:3000/api/notifications", {
                    method: "GET"
                });
                if (datas.status === 200) {
                    const data = await datas.json();
                    setNotifications(data.todos);
                    console.log("---render oldu")

                } else {
                    console.log("error")
                }
            } catch (error) {
                console.error("An error occurred while fetching todos:", error);
            }
        }
        getNotifications();
    }, [messages])


    // notification subscription
    useEffect(() => {
        if (token && pb) {
            pb.authStore.save(token);
            pb.collection('todos').subscribe('*', function (x) {
                setMessages(x);
            });

            return () => {
                pb.collection('todos').unsubscribe();
            };
        }
    }, [token]);

    const tabsDatas = [
        {
            value: "inbox",
            notifications: notifications.filter((x: any) => !x.isArchive)
        },
        {
            value: "archive",
            notifications: notifications.filter((x: any) => x.isArchive)
        }
    ]


    // archive all notifications
    const handleAllArchive = async () => {
        await fetch("http://localhost:3000/api/notifications", {
            method: "PUT",
            body: JSON.stringify({allArchive: true}),
            headers: {
                "Content-Type": "application/json"
            }
        })
    }


    return (
        <Box bg="black" h="100vh">
            <div className={classes.header}>
                <Container size="md">
                    <Group justify="space-between">
                        <MantineLogo size={28}/>
                        <Menu
                            styles={{
                                dropdown: {
                                    padding: 0,
                                    height: 500,
                                    overflow: "hidden",
                                    position: "absolute",
                                    border: "1px solid #252525",
                                    backgroundColor: "black",
                                },
                            }}
                            radius="md"
                            width={400}
                            position="bottom-end"
                            transitionProps={{transition: 'pop-top-right'}}
                            withinPortal
                            opened={opened}
                        >
                            <Menu.Target>
                                <Box pos="relative">
                                    {messages.action === "create" &&
                                        <Indicator pos="absolute" top="5px" right="5px" size={8}/>}
                                    <ActionIcon size="lg" color="#252525" onClick={toggle} radius="xl" c="white"
                                                variant="outline">
                                        <IconBell size="1.1rem"/>
                                    </ActionIcon>
                                </Box>
                            </Menu.Target>

                            <Menu.Dropdown bg="black">
                                <Tabs className={classes.tabs}
                                      variant="pills"
                                      value={activeTab} onChange={setActiveTab}
                                      classNames={{
                                          list: classes.tabList,
                                          panel: classes.tabPanel,
                                      }} color="white" defaultValue="inbox">
                                    <Tabs.List>
                                        <Tabs.Tab fw="500" p="0px" pb="12px" pt="10px" c="#a1a1a1" bg="black"
                                                  className={activeTab === "inbox" ? classes.activeTab : ""}
                                                  value="inbox">Inbox</Tabs.Tab>
                                        <Tabs.Tab fw="500" p="0px" pb="12px" pt="10px" c="#a1a1a1" bg="black"
                                                  className={activeTab === "archive" ? classes.activeTab : ""}
                                                  value="archive">Archive</Tabs.Tab>
                                    </Tabs.List>
                                    {tabsDatas.map((x: any, i: number) => (
                                        <TabsPanel notifications={x.notifications} value={x.value} key={i}/>
                                    ))}
                                    {activeTab === "inbox" &&
                                        <Box onClick={handleAllArchive} className={classes.allArchive} c="white"
                                             bg="black" p="6px">
                                            <Button variant="subtle" color="#ccc" c="white" radius="md">
                                                Archive All
                                            </Button>
                                        </Box>}
                                </Tabs>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                </Container>
            </div>
        </Box>
    );
}

export default HeaderTabs;