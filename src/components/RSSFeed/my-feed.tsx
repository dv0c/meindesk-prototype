'use client'

import { Rss as RSS } from "@prisma/client"
import { Menu, Rss } from "lucide-react"
import PageWrapper from "../PageWrapper"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog"
import { Input } from "../ui/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "../ui/input-group"
import CreateNewFeed from "./CreateButtonPage"


const data = [
    {
        id: '1',
        title: 'Example RSS Feed',
        url: 'http://localhost:3000/dashboard/68f9085d7ee6b8153a3adfde/projects/website/rss/my-feed',
        description: 'This is an example RSS feed.',
        icon: '📰',
        createdAt: new Date(),
        updatedAt: new Date(),
        siteId: 'site123',
    },
    {
        id: '1',
        title: 'Example RSS Feed',
        url: 'http://localhost:3000/dashboard/68f9085d7ee6b8153a3adfde/projects/website/rss/my-feed',
        description: 'This is an example RSS feed.',
        icon: '📰',
        createdAt: new Date(),
        updatedAt: new Date(),
        siteId: 'site123',
    },
] as RSS[]


const MyFeed = () => {
    return <PageWrapper action={<CreateRSS />} title="My RSS Feed" description="Manage your RSS feed subscriptions">
        <div className="flex items-center flex-wrap gap-5">
            {data.map((feed) => (
                <Card key={feed.id} className="p-4 border rounded-md group">
                    <CardContent className="px-3 pb-7 w-full">
                        <div className="flex w-full items-center opacity-0 transition-opacity group-hover:opacity-100 justify-end-safe">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size={'icon-sm'} variant={'ghost'} className="cursor-pointer">
                                        <Menu />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Edit Feed</DropdownMenuItem>
                                    <DropdownMenuItem>Delete Feed</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-3xl">
                                {feed.icon || <Rss />}
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-lg font-bold">{feed.title}</span>
                                <p className="text-sm text-accent leading-3 max-w-[350px] line-clamp-1">{feed.url}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </PageWrapper>
}

export default MyFeed

const CreateRSS = () => {

    return <Dialog>
        <DialogTrigger asChild>
            <Button className="cursor-pointer" variant="default">Create RSS Feed</Button>
        </DialogTrigger>
        <DialogContent className="min-w-screen">
            <CreateNewFeed />
        </DialogContent>
    </Dialog>
}