import React, {useState} from 'react';
import {Accordion, ActionIcon, Avatar, Badge, Box, Flex, Text} from "@mantine/core";
import {IconArchive, IconBrandSentry} from "@tabler/icons-react";
import classes from '../pages/Global.module.css';

interface Props {
    item: any;
}

const AccordionItem: React.FC<Props> = ({item}) => {
    const {title, description, id, isArchive, isRead, readDate} = item;
    const [hovered, setHovered] = useState(false);
    const [iconHovered, setIconHovered] = useState(false);

    const handleArchive = async () => {
        await fetch("http://localhost:3000/api/notifications", {
            method: "PUT",
            body: JSON.stringify({id, isArchive}),
            headers: {
                "Content-Type": "application/json"
            }
        })
    }



    const handleIsRead = async () => {
        await fetch("http://localhost:3000/api/notifications", {
            method: "PUT",
            body: JSON.stringify({id, isRead}),
            headers: {
                "Content-Type": "application/json"
            }
        })
    }



return (
    <Accordion.Item value={id.toString()} onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}>
        <Accordion.Control p="0px" onClick={handleIsRead}>
            <Flex gap="sm">
                <Avatar color={isArchive ? "pink" : "green"} radius="xl">
                    <IconBrandSentry size="1.5rem"/>
                </Avatar>
                <Box>
                    <Text lh={1.3} fz="14px" fw={500} c="#eaeaea">{title}</Text>
                    <Accordion.Panel>
                        <Text fw={500} fz="14px" c="#eaeaea">{description} </Text>
                    </Accordion.Panel>
                    <Text fz="14px" c="#a1a1a1">5d ago
                        {readDate &&  <Badge className={classes.badge} size="xs" ml="md" variant="outline" c="#a1a1a1"
                                color="black">{readDate?.split(".")[0]}</Badge>}
                    </Text>
                </Box>
            </Flex>
        </Accordion.Control>
        <Box m="auto" onClick={handleArchive}
             onMouseEnter={() => setIconHovered(true)}
             onMouseLeave={() => setIconHovered(false)}
             className={hovered ? classes.archiveHovered : classes.archive}>
            <ActionIcon variant={iconHovered ? "filled" : "transparent"} c="#a1a1a1" radius="xl" size="lg"
                        bg={iconHovered ? "#333" : "transparent"}>
                <IconArchive size="1.3rem"/>
            </ActionIcon>
        </Box>
    </Accordion.Item>

);
}
;

export default AccordionItem;
