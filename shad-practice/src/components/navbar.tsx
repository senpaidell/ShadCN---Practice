import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { ArrowUpIcon, Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import { CircleUser } from "lucide-react"
import Badge from '@mui/material/Badge';
import MailIcon from '@mui/icons-material/Mail';
import { Link } from "react-router-dom";

export function NavBar() {
    return (
        <>
            <div className="relative p-3 h-16 w-dvw flex flex-row gap-x-2 items-center">
                <div className="searchBar absolute left-1/2 transform -translate-x-1/2 flex w-auto">
                    <InputGroup className="w-fit sm:w-[25dvw] h-fit">
                        <InputGroupInput placeholder="Search" />
                            <InputGroupAddon>
                                <Search />
                            </InputGroupAddon>
                            <InputGroupAddon align="inline-end"># results</InputGroupAddon>
                    </InputGroup>
                </div>
                
                <div className="ml-auto flex items-center gap-x-4">
                    <div className="mail">
                        <Link to="/notifications">
                            <Badge badgeContent={69} color="primary">
                                <MailIcon sx={{fontSize: 28}} />
                            </Badge>
                        </Link>
                    </div>

                    <div className="profile">
                        <Link to="/profile">
                            <CircleUser size={28} />
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}